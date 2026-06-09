/* eslint-disable no-console -- progress output for a standalone CLI script */
// Runs the Unhead v2 compatibility fixture in an isolated temp directory.
//
// The fixture must build + run OUTSIDE the repo tree: nested under the repo, the
// parent workspace's hoisted node_modules (pinned to the Unhead v3 stack) leaks
// into Nuxt/nitro module resolution and breaks the v2 build. Copying the fixture
// to a temp dir with its own isolated install avoids that.
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, renameSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const fixtureDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(fixtureDir, '../..')
const workDir = mkdtempSync(join(tmpdir(), 'nuxt-schema-org-compat-v2-'))

const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' })

console.log(`[compat-v2] building + packing module from ${repoRoot}`)
run('pnpm', ['build'], repoRoot)
run('pnpm', ['pack', '--pack-destination', workDir], repoRoot)

console.log(`[compat-v2] staging fixture in ${workDir}`)
for (const file of ['app.vue', 'nuxt.config.ts', 'pages', 'render.test.ts', 'vitest.config.ts'])
  cpSync(join(fixtureDir, file), join(workDir, file), { recursive: true })
cpSync(join(fixtureDir, 'package.template.json'), join(workDir, 'package.json'))
const tgz = readdirSync(workDir).find(f => f.endsWith('.tgz'))
renameSync(join(workDir, tgz), join(workDir, 'module.tgz'))

console.log('[compat-v2] installing isolated v2 stack')
run('npm', ['install', '--legacy-peer-deps', '--no-package-lock'], workDir)

console.log('[compat-v2] running tests')
run('npm', ['test'], workDir)

// Regression #116: the render test above runs against the dev server, where the
// node_modules fallback masks the bug. On a v2 host the module aliases
// @unhead/schema-org to the npm-aliased @unhead/schema-org-v2, whose installed
// package.json still carries `"name": "@unhead/schema-org"`. Left external, nitro's
// dependency trace resolves the alias dir to its real package name and emits it
// under @unhead/schema-org in the output node_modules, while the import statements
// still reference @unhead/schema-org-v2. A slim production `.output/server` (no
// project-root node_modules, e.g. a Docker image, especially under pnpm's symlinked
// alias layout) then crashes with ERR_MODULE_NOT_FOUND. Run a real production build
// and assert the v2 copy was inlined, so no bare alias specifier survives at all.
//
// NOTE: this harness installs with npm (flat node_modules), so the trace keeps the
// @unhead/schema-org-v2 dir name and a no-fix build would still *run* here. The
// assertion therefore checks the import was eliminated, not that the server boots.
console.log('[compat-v2] building production output')
run('npm', ['run', 'build'], workDir)

const serverDir = join(workDir, '.output', 'server')
if (!existsSync(serverDir))
  throw new Error(`[compat-v2] ${serverDir} not found — production build did not emit a server bundle`)

// matches the bare specifier and any subpath, e.g. `@unhead/schema-org-v2/vue`
const externalImport = /(?:from|import|require)\s*(?:\(\s*)?['"]@unhead\/schema-org-v2(?:\/[^'"]*)?['"]/
const offenders = []
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory())
      walk(full)
    else if (/\.[mc]?js$/.test(entry) && externalImport.test(readFileSync(full, 'utf8')))
      offenders.push(full.slice(serverDir.length + 1))
  }
}
walk(serverDir)

if (offenders.length) {
  throw new Error(
    `[compat-v2] server chunks import @unhead/schema-org-v2 as an external (regression #116): ${offenders.join(', ')}`,
  )
}
console.log('[compat-v2] ✓ @unhead/schema-org-v2 inlined into the server bundle')
