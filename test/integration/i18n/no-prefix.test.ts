import { resolve } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils'
import { load } from 'cheerio'
import { describe, expect, it } from 'vitest'

await setup({
  rootDir: resolve(import.meta.dirname, '../../fixtures/i18n-no-prefix'),
  build: true,
  server: true,
})

async function $fetchSchemaOrg(path: string, headers?: Record<string, string>) {
  const html = await $fetch(path, { headers })
  const $ = load(html as string)
  return JSON.parse($('script[type="application/ld+json"]').text())
}

describe('i18n no_prefix', () => {
  it('does not emit workTranslation on the default locale', async () => {
    const schemaOrg = await $fetchSchemaOrg('/')
    const webSite = schemaOrg['@graph'].find(node => node['@type'] === 'WebSite')

    expect(webSite).not.toHaveProperty('workTranslation')
  })

  it('does not emit translationOfWork on a non-default locale', async () => {
    const schemaOrg = await $fetchSchemaOrg('/', { cookie: 'i18n_redirected=ja' })
    const webSite = schemaOrg['@graph'].find(node => node['@type'] === 'WebSite')

    expect(webSite).not.toHaveProperty('translationOfWork')
  })
})
