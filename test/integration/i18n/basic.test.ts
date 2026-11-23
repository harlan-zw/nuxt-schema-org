import { resolve } from 'node:path'
import { setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { $fetchSchemaOrg } from '../utils'

await setup({
  rootDir: resolve(import.meta.dirname, '../../fixtures/i18n'),
  build: true,
  server: true,
})

describe('pages', () => {
  it('render en', async () => {
    const home = await $fetchSchemaOrg('/')
    expect(home).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@id": "https://nuxtseo.com/en#website",
            "@type": "WebSite",
            "description": "The quickest and easiest way to build Schema.org graphs for Nuxt.",
            "inLanguage": "en-US",
            "name": "nuxt-schema-org",
            "publisher": {
              "@id": "https://nuxtseo.com/#identity",
            },
            "url": "https://nuxtseo.com/en",
            "workTranslation": [
              {
                "@id": "https://nuxtseo.com/ja#website",
              },
              {
                "@id": "https://nuxtseo.com/zh#website",
              },
            ],
          },
          {
            "@id": "https://nuxtseo.com/en#webpage",
            "@type": "WebPage",
            "about": {
              "@id": "https://nuxtseo.com/#identity",
            },
            "description": "The quickest and easiest way to build Schema.org graphs for Nuxt.",
            "isPartOf": {
              "@id": "https://nuxtseo.com/en#website",
            },
            "name": "Welcome",
            "potentialAction": [
              {
                "@type": "ReadAction",
                "target": [
                  "https://nuxtseo.com/en",
                ],
              },
            ],
            "url": "https://nuxtseo.com/en",
          },
          {
            "@id": "https://nuxtseo.com/#identity",
            "@type": "Organization",
            "name": "nuxt-schema-org",
            "url": "https://nuxtseo.com",
          },
        ],
      }
    `)
  })
  it('render ja', async () => {
    expect(await $fetchSchemaOrg('/ja')).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@id": "https://nuxtseo.com/ja#website",
            "@type": "WebSite",
            "description": "The quickest and easiest way to build Schema.org graphs for Nuxt.",
            "inLanguage": "ja",
            "name": "nuxt-schema-org",
            "publisher": {
              "@id": "https://nuxtseo.com/#identity",
            },
            "translationOfWork": {
              "@id": "https://nuxtseo.com/en#website",
            },
            "url": "https://nuxtseo.com/ja",
          },
          {
            "@id": "https://nuxtseo.com/ja#webpage",
            "@type": "WebPage",
            "about": {
              "@id": "https://nuxtseo.com/#identity",
            },
            "description": "The quickest and easiest way to build Schema.org graphs for Nuxt.",
            "isPartOf": {
              "@id": "https://nuxtseo.com/ja#website",
            },
            "name": "ようこそ",
            "potentialAction": [
              {
                "@type": "ReadAction",
                "target": [
                  "https://nuxtseo.com/ja",
                ],
              },
            ],
            "url": "https://nuxtseo.com/ja",
          },
          {
            "@id": "https://nuxtseo.com/#identity",
            "@type": "Organization",
            "name": "nuxt-schema-org",
            "url": "https://nuxtseo.com",
          },
        ],
      }
    `)
  })
  it.each(['/en/', '/ja/'])('links the identity from locale homepage %s', async (path) => {
    const schemaOrg = await $fetchSchemaOrg(path)
    const webPage = schemaOrg['@graph'].find(node => node['@type'] === 'WebPage')

    expect(webPage.about).toEqual({ '@id': 'https://nuxtseo.com/#identity' })
  })
  it('does not link the identity from nested locale pages', async () => {
    const schemaOrg = await $fetchSchemaOrg('/ja/about')
    const webPage = schemaOrg['@graph'].find((node) => {
      const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']]
      return types.includes('WebPage')
    })

    expect(webPage).toBeDefined()
    expect(webPage).not.toHaveProperty('about')
  })
  it.each(['/en/described', '/zh/described'])('page meta description wins on %s', async (path) => {
    const schemaOrg = await $fetchSchemaOrg(path)
    const webPage = schemaOrg['@graph'].find(node => node['@type'] === 'WebPage')

    expect(webPage.description).toBe('PAGE')
  })
  it('falls back to the per-locale site description without page meta', async () => {
    const schemaOrg = await $fetchSchemaOrg('/zh/about')
    const webPage = schemaOrg['@graph'].find((node) => {
      const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']]
      return types.includes('WebPage')
    })
    const webSite = schemaOrg['@graph'].find(node => node['@type'] === 'WebSite')

    expect(webPage.description).toBe('ZH site description')
    expect(webSite.description).toBe('ZH site description')
  })
  it.each(['/', '/en/', '/ja/', '/ja/about'])('every graph node on %s is typed and resolved (#155)', async (path) => {
    const schemaOrg = await $fetchSchemaOrg(path)
    for (const node of schemaOrg['@graph']) {
      expect(node['@type'], `node ${node['@id']} on ${path} has no @type`).toBeTruthy()
      expect(node['@id'], `orphan node on ${path}`).not.toMatch(/#\/schema\/\//)
    }
  })
})

it.each([
  { locale: 'en', reference: 'workTranslation', target: 'https://nuxtseo.com/ja#website' },
  { locale: 'ja', reference: 'translationOfWork', target: 'https://nuxtseo.com/en#website' },
])('merges WebSite customizations into the $locale graph', async ({ locale, reference, target }) => {
  const { '@graph': graph } = await $fetchSchemaOrg(`/${locale}/custom-website`)
  const websiteUrl = `https://nuxtseo.com/${locale}`
  const websiteId = `${websiteUrl}#website`
  const website = graph.find((node: Record<string, unknown>) => node.name === 'Custom website')
  const page = graph.find((node: Record<string, unknown>) => node['@type'] === 'WebPage')

  expect(website).toMatchObject({
    '@id': websiteId,
    'url': websiteUrl,
    'description': 'Custom description',
  })
  expect([website[reference]].flat()).toContainEqual({ '@id': target })
  expect(page.isPartOf).toEqual({ '@id': websiteId })
  expect(graph).toContainEqual(expect.objectContaining({
    '@id': 'https://example.com/#separate-website',
    'name': 'Separate website',
  }))
})

it('links the page to an explicitly identified WebSite override', async () => {
  const { '@graph': graph } = await $fetchSchemaOrg('/ja/custom-website?customIdentity=true')
  const websiteId = 'https://example.com/custom#website'
  const website = graph.find((node: Record<string, unknown>) => node.name === 'Custom website')
  const page = graph.find((node: Record<string, unknown>) => node['@type'] === 'WebPage')

  expect(website).toMatchObject({
    '@id': websiteId,
    'url': 'https://example.com/custom',
    'translationOfWork': { '@id': 'https://nuxtseo.com/en#website' },
  })
  expect(page.isPartOf).toEqual({ '@id': websiteId })
})

it('preserves a relative WebSite URL override and an explicit WebPage parent', async () => {
  const { '@graph': graph } = await $fetchSchemaOrg('/ja/custom-website?customUrl=true&customParent=true')
  const website = graph.find((node: Record<string, unknown>) => node.name === 'Custom website')
  const page = graph.find((node: Record<string, unknown>) => node['@type'] === 'WebPage')

  expect(website).toMatchObject({
    '@id': 'https://nuxtseo.com/ja#website',
    'url': '/about-the-site',
  })
  expect(page.isPartOf).toEqual({ '@id': 'https://example.com/#separate-website' })
})
