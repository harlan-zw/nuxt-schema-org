import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const vitestPackage = require.resolve('vitest/package.json')
const requireFromVitest = createRequire(join(dirname(vitestPackage), 'index.js'))
const vitePackage = requireFromVitest.resolve('vite/package.json')
const requireFromVite = createRequire(join(dirname(vitePackage), 'index.js'))
const rolldownPackage = requireFromVite.resolve('rolldown/package.json')
const rolldownBin = join(dirname(rolldownPackage), 'bin/cli.mjs')

describe('runtime build warnings', () => {
  it('only reads exports provided by the v3 schema org runtime', () => {
    const root = mkdtempSync(join(tmpdir(), 'nuxt-schema-org-build-'))
    const source = readFileSync(new URL('../../src/runtime/app/utils/shared.ts', import.meta.url), 'utf8')
      .replaceAll('@unhead/schema-org/vue', './schema-org-vue.mjs')
      .replace('../composables/useSchemaOrg', 'useSchemaOrg')
      .replace('./config', 'schemaOrgConfig')

    writeFileSync(join(root, 'shared.ts'), source)
    writeFileSync(join(root, 'schema-org-vue.mjs'), `
export const UnheadSchemaOrg = () => {}
export const defineOrganization = () => {}
export const definePerson = () => {}
export const defineLocalBusiness = () => {}
`)

    const result = spawnSync(process.execPath, [
      rolldownBin,
      join(root, 'shared.ts'),
      '--file',
      join(root, 'shared.mjs'),
      '--format',
      'esm',
      '--external',
      [
        'nuxt/app',
        'nuxt-site-config/urls',
        'ufo',
        'vue',
        '#imports',
        '#site-config/app/composables/useSiteConfig',
        '#site-config/app/composables/utils',
        'useSchemaOrg',
        'schemaOrgConfig',
      ].join(','),
    ], {
      encoding: 'utf8',
    })

    rmSync(root, { recursive: true, force: true })

    expect(result.status, result.stderr).toBe(0)
    expect(result.stderr).not.toContain('IMPORT_IS_UNDEFINED')
  })
})
