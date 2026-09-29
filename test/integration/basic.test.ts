import { resolve } from 'node:path'
import { setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { $fetchSchemaOrg } from './utils'

await setup({
  rootDir: resolve(import.meta.dirname, '../fixtures/basic'),
  server: true,
  browser: false,
})

describe('pages', () => {
  it('render index', async () => {
    const schema = await $fetchSchemaOrg('/')

    // Snapshot
    expect(schema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@id": "https://nuxtseo.com/#website",
            "@type": "WebSite",
            "description": "The quickest and easiest way to build Schema.org graphs for Nuxt.",
            "name": "My Website",
            "publisher": {
              "@id": "https://nuxtseo.com/#identity",
            },
            "url": "https://nuxtseo.com/",
          },
          {
            "@id": "https://nuxtseo.com/#webpage",
            "@type": "WebPage",
            "about": {
              "@id": "https://nuxtseo.com/#identity",
            },
            "description": "The quickest and easiest way to build Schema.org graphs for Nuxt.",
            "isPartOf": {
              "@id": "https://nuxtseo.com/#website",
            },
            "potentialAction": [
              {
                "@type": "ReadAction",
                "target": [
                  "https://nuxtseo.com/",
                ],
              },
            ],
            "url": "https://nuxtseo.com/",
          },
          {
            "@id": "https://nuxtseo.com/#identity",
            "@type": "Person",
            "jobTitle": "Software Engineer",
            "name": "Harlan",
            "url": "https://nuxtseo.com/",
          },
        ],
      }
    `)
  })

  it('render computed ref with Nuxt composable context', async () => {
    const schema = await $fetchSchemaOrg('/computed-nuxt-context')

    const articleNode = schema['@graph'].find(n => n['@type'] === 'Article')
    expect(articleNode).toBeTruthy()
    expect(articleNode.headline).toContain('Computed context test')
    expect(articleNode.description).toBe('Testing computed ref with Nuxt composable context')
  })

  it('render computed post', async () => {
    const schema = await $fetchSchemaOrg('/reactivity-computed')

    const articleNode = schema['@graph'].filter(n => n['@type'] === 'Article')[0]
    // Snapshot
    expect(articleNode).toMatchInlineSnapshot(`
      {
        "@id": "https://nuxtseo.com/reactivity-computed#article",
        "@type": "Article",
        "author": {
          "@id": "https://nuxtseo.com/#identity",
        },
        "description": "Harlan Wilton - Last Name",
        "headline": "Harlan Wilton - Last Name",
        "image": {
          "@id": "https://nuxtseo.com/#/schema/image/1",
        },
        "isPartOf": {
          "@id": "https://nuxtseo.com/reactivity-computed#webpage",
        },
        "mainEntityOfPage": {
          "@id": "https://nuxtseo.com/reactivity-computed#webpage",
        },
        "publisher": {
          "@id": "https://nuxtseo.com/#identity",
        },
        "thumbnailUrl": "https://emojiguide.org/images/emoji/n/3ep4zx1jztp0n.png",
      }
    `)
  })
  it('applies schema-org:meta hook overrides', async () => {
    const schema = await $fetchSchemaOrg('/plugin-override')
    const webPage = schema['@graph'].find(n => n['@type'] === 'WebPage')
    expect(webPage['@id']).toBe('https://override-example.com/plugin-override#webpage')
    expect(webPage.url).toBe('https://override-example.com/plugin-override')
    const webSite = schema['@graph'].find(n => n['@type'] === 'WebSite')
    expect(new URL(webSite['@id']).host).toBe('override-example.com')
  })

  it('ranks a schema-org:meta hook url above a page canonical link', async () => {
    const schema = await $fetchSchemaOrg('/plugin-override-canonical')
    const webPage = schema['@graph'].find(n => n['@type'] === 'WebPage')
    expect(webPage['@id']).toBe('https://override-example.com/custom-path#webpage')
    expect(webPage.url).toBe('https://override-example.com/custom-path')
  })

  it('uses the page canonical link for the WebPage url', async () => {
    const schema = await $fetchSchemaOrg('/canonical')
    const webPage = schema['@graph'].find(n => n['@type'] === 'WebPage')
    expect(webPage.url).toBe('https://nuxtseo.com/canonical-target')
    expect(webPage['@id']).toBe('https://nuxtseo.com/canonical-target#webpage')
  })

  it('awaits an async schema-org:meta hook', async () => {
    const schema = await $fetchSchemaOrg('/plugin-override-async')
    const webPage = schema['@graph'].find(n => n['@type'] === 'WebPage')
    expect(webPage.url).toBe('https://async-override-example.com/plugin-override-async')
  })

  it('leaves other routes untouched by the schema-org:meta hook', async () => {
    const schema = await $fetchSchemaOrg('/about')
    const webPage = schema['@graph'].find(n => n['@type'] === 'AboutPage' || n['@type']?.includes?.('AboutPage'))
    expect(webPage.url).toBe('https://nuxtseo.com/about')
  })
})
