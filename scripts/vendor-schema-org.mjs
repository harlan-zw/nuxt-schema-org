// Copies both @unhead/schema-org majors into dist/vendor so the published
// package carries no `@unhead/schema-org*` dependency at all. The npm-aliased
// `@unhead/schema-org-v2` dep 404s on registries/buildpacks that don't support
// `npm:` aliases, and the v3 copy's optional peer on `@unhead/vue@^3` marks
// Nuxt's unhead v2 tree invalid in `npm ls` (#125). The module aliases
// `@unhead/schema-org` imports onto these files at app build time and inlines
// them into the bundles, so they only need to exist inside this package.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readPackageJSON, resolvePackageJSON } from 'pkg-types'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const vendorRoot = join(repoRoot, 'dist', 'vendor')

// only the entries the module consumes: root + /vue and their internal chunks.
// react/svelte/solid entry files are dropped; unused chunk files are dead
// weight but harmless (nothing imports them, bundlers never see them).
const DIST_ENTRIES = ['index.mjs', 'index.d.ts', 'index.d.mts', 'vue.mjs', 'vue.d.ts', 'vue.d.mts', 'chunks', 'shared']

const VENDORS = [
  { pkg: '@unhead/schema-org', out: 'schema-org-v3' },
  { pkg: '@unhead/schema-org-v2', out: 'schema-org-v2' },
]

rmSync(vendorRoot, { recursive: true, force: true })

for (const { pkg, out } of VENDORS) {
  const pkgJsonPath = await resolvePackageJSON(pkg, { url: repoRoot })
  const { version } = await readPackageJSON(pkgJsonPath)
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
  // traceability only. Deliberately NOT a package.json: a nested manifest
  // carrying the real package name is what broke nitro's dependency trace (#116).
  writeFileSync(join(outDir, 'vendor.json'), `${JSON.stringify({ name: '@unhead/schema-org', version }, null, 2)}\n`)
  console.log(`[vendor] ${pkg}@${version} -> dist/vendor/${out}`)
}
