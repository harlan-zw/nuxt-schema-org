import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const rootPackage = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))
const fixturePackage = JSON.parse(readFileSync(new URL('../fixtures/nuxt5/package.json', import.meta.url), 'utf8'))
const fixtureTest = readFileSync(new URL('../fixtures/nuxt5/test.mjs', import.meta.url), 'utf8')

describe('nuxt 5 release fixture', () => {
  it('uses a version-independent packed module path', () => {
    expect(rootPackage.scripts['test:nuxt5']).toContain('--out test/fixtures/nuxt5/nuxt-schema-org.tgz')
    expect(fixturePackage.dependencies['nuxt-schema-org']).toBe('file:./nuxt-schema-org.tgz')
  })

  it('uses the repository pnpm version', () => {
    expect(fixturePackage.packageManager).toBe(rootPackage.packageManager)
  })

  it('derives its expected module version from the root manifest', () => {
    expect(fixtureTest).toContain('new URL(\'../../../package.json\', import.meta.url)')
    expect(fixtureTest).not.toContain(`'${rootPackage.version}'`)
  })
})
