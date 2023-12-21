import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils'
import { $fetchSchemaOrg } from './utils'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/nuxt', import.meta.url)),
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
            "@id": "https://example.com/#website",
            "@type": "WebSite",
            "description": "Schema.org for Nuxt",
            "name": "My Website",
            "publisher": {
              "@id": "https://example.com/#identity",
            },
            "url": "https://example.com",
          },
          {
            "@id": "https://example.com/#webpage",
            "@type": "WebPage",
            "about": {
              "@id": "https://example.com/#identity",
            },
            "description": "Schema.org for Nuxt",
            "isPartOf": {
              "@id": "https://example.com/#website",
            },
            "potentialAction": [
              {
                "@type": "ReadAction",
                "target": [
                  "https://example.com",
                ],
              },
              {
                "@type": "ReadAction",
                "target": [
                  "https://example.com",
                ],
              },
            ],
            "url": "https://example.com",
          },
          {
            "@id": "https://example.com/#identity",
            "@type": "Person",
            "jobTitle": "Software Engineer",
            "name": "Harlan",
            "url": "https://example.com",
          },
        ],
      }
    `)
  })

  it('render computed post', async () => {
    const schema = await $fetchSchemaOrg('/reactivity-computed')

    const articleNode = schema['@graph'].filter(n => n['@type'] === 'Article')[0]
    // Snapshot
    expect(articleNode).toMatchInlineSnapshot(`
      {
        "@id": "https://example.com/reactivity-computed/#article",
        "@type": "Article",
        "author": {
          "@id": "https://example.com/#identity",
        },
        "description": "Harlan Wilton - Last Name",
        "headline": "Harlan Wilton - Last Name",
        "image": {
          "@id": "https://example.com/#/schema/image/4c11be9",
        },
        "isPartOf": {
          "@id": "https://example.com/reactivity-computed/#webpage",
        },
        "mainEntityOfPage": {
          "@id": "https://example.com/reactivity-computed/#webpage",
        },
        "publisher": {
          "@id": "https://example.com/#identity",
        },
        "thumbnailUrl": "https://emojiguide.org/images/emoji/n/3ep4zx1jztp0n.png",
      }
    `)
  })
})
