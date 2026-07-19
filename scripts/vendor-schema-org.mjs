// Copies both @unhead/schema-org majors into dist/vendor so the published
// package carries no `@unhead/schema-org*` dependency at all. The npm-aliased
// `@unhead/schema-org-v2` dep 404s on registries/buildpacks that don't support
// `npm:` aliases, and the v3 copy's optional peer on `@unhead/vue@^3` marks
// Nuxt's unhead v2 tree invalid in `npm ls` (#125). The module aliases
// `@unhead/schema-org` imports onto these files at app build time and inlines
// them into the bundles, so they only need to exist inside this package.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readPackageJSON, resolvePackageJSON } from 'pkg-types'

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
  { pkg: '@unhead/schema-org', out: 'schema-org-v3' },
  { pkg: '@unhead/schema-org-v2', out: 'schema-org-v2' },
]

const V2_VUE_EXTRA_RESOLVERS = [
  ['defineDataset', 'dataset', 'Dataset'],
  ['defineMusicAlbum', 'musicAlbum', 'MusicAlbum'],
  ['defineMusicGroup', 'musicGroup', 'MusicGroup'],
  ['defineMusicPlaylist', 'musicPlaylist', 'MusicPlaylist'],
  ['defineMusicRecording', 'musicRecording', 'MusicRecording'],
  ['definePodcastEpisode', 'podcastEpisode', 'PodcastEpisode'],
  ['definePodcastSeason', 'podcastSeason', 'PodcastSeason'],
  ['definePodcastSeries', 'podcastSeries', 'PodcastSeries'],
  ['defineService', 'service', 'Service'],
  ['defineTVEpisode', 'tvEpisode', 'TVEpisode'],
  ['defineTVSeason', 'tvSeason', 'TVSeason'],
  ['defineTVSeries', 'tvSeries', 'TVSeries'],
]

function exportedNames(code) {
  const names = new Set()
  for (const match of code.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const rawName of match[1].split(',')) {
      const name = rawName.trim()
      if (!name)
        continue
      const alias = name.match(/\bas\s+([A-Za-z_$][\w$]*)$/)
      names.add(alias ? alias[1] : name)
    }
  }
  return names
}

function addToFinalExport(code, names) {
  const exported = exportedNames(code)
  const missing = names.filter(name => !exported.has(name))
  if (!missing.length)
    return code

  const exportStart = code.lastIndexOf('\nexport { ')
  if (exportStart === -1)
    throw new Error('Could not find final export block in schema-org v2 vue entry.')
  const listStart = exportStart + '\nexport { '.length
  const listEnd = code.indexOf(' };', listStart)
  if (listEnd === -1)
    throw new Error('Could not find final export block end in schema-org v2 vue entry.')

  const namesList = code.slice(listStart, listEnd).split(',').map(name => name.trim()).filter(Boolean)
  return `${code.slice(0, listStart)}${[...namesList, ...missing].join(', ')}${code.slice(listEnd)}`
}

function patchSchemaOrgV2VueRuntime(outDir) {
  const file = join(outDir, 'vue.mjs')
  let code = readFileSync(file, 'utf8')
  const missingResolvers = V2_VUE_EXTRA_RESOLVERS.filter(([name]) => !code.includes(`function ${name}(`))

  if (missingResolvers.length) {
    const resolverCode = missingResolvers.map(([name, resolver]) => `function ${name}(input) {
  return provideResolver(input, "${resolver}");
}`).join('\n')
    const marker = 'function useSchemaOrg(input = [], options = {}) {'
    if (!code.includes(marker))
      throw new Error('Could not find useSchemaOrg marker in schema-org v2 vue runtime.')
    code = code.replace(marker, `${resolverCode}\n${marker}`)
  }

  code = addToFinalExport(code, [
    'UnheadSchemaOrg',
    ...V2_VUE_EXTRA_RESOLVERS.map(([name]) => name),
  ])

  const exports = exportedNames(code)
  const missingExports = ['UnheadSchemaOrg', ...V2_VUE_EXTRA_RESOLVERS.map(([name]) => name)]
    .filter(name => !exports.has(name))
  if (missingExports.length)
    throw new Error(`schema-org v2 vue runtime is missing exports: ${missingExports.join(', ')}`)

  writeFileSync(file, code)
}

function patchSchemaOrgV2VueTypes(outDir, entry) {
  const file = join(outDir, entry)
  let code = readFileSync(file, 'utf8')
  const indexSpecifier = './index.mjs'
  const typeNames = V2_VUE_EXTRA_RESOLVERS.map(([, , typeName]) => typeName)

  if (!exportedNames(code).has('UnheadSchemaOrg'))
    code = `export { UnheadSchemaOrg } from '${indexSpecifier}';\n${code}`

  const typeImport = `import type { ${typeNames.join(', ')} } from '${indexSpecifier}';`
  if (!code.includes(typeImport))
    code = code.replace('import { ComponentResolver } from \'unplugin-vue-components\';', `${typeImport}\nimport { ComponentResolver } from 'unplugin-vue-components';`)

  const missingResolvers = V2_VUE_EXTRA_RESOLVERS.filter(([name]) => !code.includes(`declare function ${name}<`))
  if (missingResolvers.length) {
    const declarations = missingResolvers.map(([name, , typeName]) => `declare function ${name}<T extends Record<string, any>>(input?: DeepResolvableProperties<${typeName} & T>): DeepResolvableProperties<${typeName} & T>;`).join('\n')
    const marker = 'declare function defineSoftwareApp'
    if (!code.includes(marker))
      throw new Error(`Could not find defineSoftwareApp marker in schema-org v2 vue types ${entry}.`)
    code = code.replace(marker, `${declarations}\n${marker}`)
  }

  code = addToFinalExport(code, V2_VUE_EXTRA_RESOLVERS.map(([name]) => name))

  const exports = exportedNames(code)
  const missingExports = ['UnheadSchemaOrg', ...V2_VUE_EXTRA_RESOLVERS.map(([name]) => name)]
    .filter(name => !exports.has(name))
  if (missingExports.length)
    throw new Error(`schema-org v2 vue types ${entry} are missing exports: ${missingExports.join(', ')}`)

  writeFileSync(file, code)
}

function patchSchemaOrgV2Vue(outDir) {
  // @unhead/schema-org v2 advertises the v3-era define* helpers in
  // schemaOrgAutoImports, but its /vue entry forgot to export them. Nuxt imports
  // every advertised helper from the source, so the copied v2 entry must be
  // self-consistent for Unhead v2 hosts (#129).
  patchSchemaOrgV2VueRuntime(outDir)
  patchSchemaOrgV2VueTypes(outDir, 'vue.d.ts')
  patchSchemaOrgV2VueTypes(outDir, 'vue.d.mts')
}

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
  if (out === 'schema-org-v2')
    patchSchemaOrgV2Vue(outDir)
  validateRelativeRuntimeImports(outDir)
  // traceability only. Deliberately NOT a package.json: a nested manifest
  // carrying the real package name is what broke nitro's dependency trace (#116).
  writeFileSync(join(outDir, 'vendor.json'), `${JSON.stringify({ name: '@unhead/schema-org', version }, null, 2)}\n`)
  console.log(`[vendor] ${pkg}@${version} -> dist/vendor/${out}`)
}
