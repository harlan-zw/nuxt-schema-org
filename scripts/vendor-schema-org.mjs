// Vendor the supported Unhead 3 runtime without adding consumer dependencies.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { findPackageJSON } from 'node:module'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const vendorRoot = join(repoRoot, 'dist', 'vendor')

// Only the entries the module consumes: root + /vue and their internal modules.
// react/svelte/solid entry files are dropped; unused chunk files are dead weight
// but harmless (nothing imports them, bundlers never see them).
const DIST_ENTRIES = [
  'index.mjs',
  'index.d.ts',
  'index.d.mts',
  'imports.mjs',
  'imports.d.ts',
  'imports.d.mts',
  'vue.mjs',
  'vue.d.ts',
  'vue.d.mts',
  'vue',
  'chunks',
  'shared',
]

const VENDORS = [
  { pkg: '@unhead/schema-org', out: 'schema-org-v3', major: 3 },
]

function validateRelativeRuntimeImports(outDir) {
  const dirs = [outDir]
  const missing = []

  while (dirs.length) {
    const dir = dirs.pop()
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = join(dir, entry.name)
      if (entry.isDirectory()) {
        dirs.push(file)
        continue
      }
      if (!entry.name.endsWith('.mjs'))
        continue

      const code = readFileSync(file, 'utf8')
      for (const match of code.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["'](\.[^"']+)["']/g)) {
        const specifier = match[1]
        if (!existsSync(join(dirname(file), specifier)))
          missing.push(`${relative(outDir, file)} -> ${specifier}`)
      }
    }
  }

  if (missing.length)
    throw new Error(`Vendored runtime has missing relative imports:\n${missing.map(importPath => `- ${importPath}`).join('\n')}`)
}

rmSync(vendorRoot, { recursive: true, force: true })

for (const { pkg, out, major } of VENDORS) {
  const pkgJsonPath = findPackageJSON(pkg, import.meta.url)
  if (!pkgJsonPath)
    throw new Error(`Cannot find package manifest for ${pkg}`)
  const { version } = JSON.parse(readFileSync(pkgJsonPath, 'utf8'))
  if (Number.parseInt(version, 10) !== major)
    throw new Error(`${pkg} must resolve to schema-org v${major}, received v${version}`)
  const pkgDir = dirname(pkgJsonPath)
  const outDir = join(vendorRoot, out)
  mkdirSync(outDir, { recursive: true })
  for (const entry of DIST_ENTRIES) {
    const src = join(pkgDir, 'dist', entry)
    // chunks/ and shared/ layouts differ between majors; missing entries are expected
    if (existsSync(src))
      cpSync(src, join(outDir, entry), { recursive: true })
  }
  cpSync(join(pkgDir, 'LICENSE'), join(outDir, 'LICENSE'))
  validateRelativeRuntimeImports(outDir)
  // traceability only. Deliberately NOT a package.json: a nested manifest
  // carrying the real package name is what broke nitro's dependency trace (#116).
  writeFileSync(join(outDir, 'vendor.json'), `${JSON.stringify({ name: '@unhead/schema-org', version }, null, 2)}\n`)
  console.log(`[vendor] ${pkg}@${version} -> dist/vendor/${out}`)
}
