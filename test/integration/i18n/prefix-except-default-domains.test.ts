import { resolve } from 'node:path'
import { setup } from '@nuxt/test-utils'
import { expect, it } from 'vitest'
import { $fetchSchemaOrg } from '../utils'

await setup({
  rootDir: resolve(import.meta.dirname, '../../fixtures/i18n-domains'),
  build: true,
  server: true,
  nuxtConfig: {
    // @ts-expect-error untyped
    i18n: {
      strategy: 'prefix_except_default',
      customRoutes: 'config',
      pages: { index: { en: '/en/welcome', ja: '/ja/welcome', zh: '/welcome' } },
    },
  },
})

it('retains custom paths on singular locale domains', async () => {
  const graph = await $fetchSchemaOrg('/en/welcome')
  const website = graph['@graph'].find((node: { '@type': string }) => node['@type'] === 'WebSite')
  expect(website['@id']).toBe('https://en.nuxtseo.com/en/welcome#website')
  expect(website.workTranslation).toEqual([
    { '@id': 'http://jp.nuxtseo.com:3000/ja/welcome#website' },
    { '@id': 'https://zh.nuxtseo.com/welcome#website' },
  ])
})
