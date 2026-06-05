/* eslint-disable no-console -- progress output for a standalone CLI script */
// Runs the Unhead v2 compatibility fixture in an isolated temp directory.
//
// The fixture must build + run OUTSIDE the repo tree: nested under the repo, the
// parent workspace's hoisted node_modules (pinned to the Unhead v3 stack) leaks
// into Nuxt/nitro module resolution and breaks the v2 build. Copying the fixture
// to a temp dir with its own isolated install avoids that.
import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readdirSync, renameSync } from 'node:fs'
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
