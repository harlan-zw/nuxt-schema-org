import { resolve } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils'
import { load } from 'cheerio'
import { describe, expect, it } from 'vitest'

await setup({
  rootDir: resolve(import.meta.dirname, '../../fixtures/i18n-multi-domains'),
  build: true,
  server: true,
})

async function website(path: string, host: string) {
  const html = await $fetch<string>(path, { headers: { 'x-forwarded-host': host, 'x-forwarded-proto': 'https' } })
  const graph = JSON.parse(load(html)('script[type="application/ld+json"]').text())['@graph']
  return graph.find((node: { '@type': string }) => node['@type'] === 'WebSite')
}

describe('domain translation references', () => {
  it('uses each canonical domain and its custom home path', async () => {
    const home = await website('/docs/en/welcome', 'en.example')
    expect(home.workTranslation).toEqual([
      { '@id': 'https://de.example/docs/willkommen#website' },
      { '@id': 'https://en.example/docs/fr/bonjour#website' },
    ])
  })

  it('links translations to the canonical original website', async () => {
    const home = await website('/docs/de/willkommen', 'en.example')
    expect(home['@id']).toBe('https://de.example/docs/willkommen#website')
    expect(home.translationOfWork).toEqual({ '@id': 'https://en.example/docs/en/welcome#website' })
  })

  it('keeps canonical translation IDs stable on another host', async () => {
    const home = await website('/docs/willkommen', 'de.example')
    expect(home['@id']).toBe('https://de.example/docs/willkommen#website')
    expect(home.translationOfWork).toEqual({ '@id': 'https://en.example/docs/en/welcome#website' })
  })
})
