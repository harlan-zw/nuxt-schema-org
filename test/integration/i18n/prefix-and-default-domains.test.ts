import { resolve } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils'
import { load } from 'cheerio'
import { expect, it } from 'vitest'

await setup({
  rootDir: resolve(import.meta.dirname, '../../fixtures/i18n-multi-domains'),
  build: true,
  server: true,
  // @ts-expect-error untyped
  nuxtConfig: { i18n: { strategy: 'prefix_and_default' } },
})

it('uses the default route variant without removing a custom locale-like segment', async () => {
  const html = await $fetch<string>('/docs/en/welcome', { headers: { 'x-forwarded-host': 'en.example', 'x-forwarded-proto': 'https' } })
  const graph = JSON.parse(load(html)('script[type="application/ld+json"]').text())['@graph']
  const website = graph.find((node: { '@type': string }) => node['@type'] === 'WebSite')
  expect(website['@id']).toBe('https://en.example/docs/en/welcome#website')
  expect(website.workTranslation).toEqual([
    { '@id': 'https://de.example/docs/willkommen#website' },
    { '@id': 'https://en.example/docs/fr/bonjour#website' },
  ])
})
