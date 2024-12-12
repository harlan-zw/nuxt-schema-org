import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { $fetchSchemaOrg } from './utils'

await setup({
  rootDir: fileURLToPath(new URL('../fixtures/basic', import.meta.url)),
  server: true,
  browser: false,
  nuxtConfig: {
    app: {
      baseURL: '/prefix/',
    },
  }
})

describe('base', () => {
  it('render index', async () => {
    const schema = await $fetchSchemaOrg('/prefix/')

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
            "url": "https://nuxtseo.com",
          },
          {
            "@id": "https://nuxtseo.com/prefix/#webpage",
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
                  "https://nuxtseo.com/prefix",
                ],
              },
            ],
            "url": "https://nuxtseo.com/prefix",
          },
          {
            "@id": "https://nuxtseo.com/#identity",
            "@type": "Person",
            "jobTitle": "Software Engineer",
            "name": "Harlan",
            "url": "https://nuxtseo.com",
          },
        ],
      }
    `)
  })

  it('render computed post', async () => {
    const schema = await $fetchSchemaOrg('/prefix/reactivity-computed')

    const articleNode = schema['@graph'].filter(n => n['@type'] === 'Article')[0]
    // Snapshot
    expect(articleNode).toMatchInlineSnapshot(`
      {
        "@id": "https://nuxtseo.com/prefix/reactivity-computed/#article",
        "@type": "Article",
        "author": {
          "@id": "https://nuxtseo.com/#identity",
        },
        "description": "Harlan Wilton - Last Name",
        "headline": "Harlan Wilton - Last Name",
        "image": {
          "@id": "https://nuxtseo.com/#/schema/image/4c11be9",
        },
        "isPartOf": {
          "@id": "https://nuxtseo.com/prefix/reactivity-computed/#webpage",
        },
        "mainEntityOfPage": {
          "@id": "https://nuxtseo.com/prefix/reactivity-computed/#webpage",
        },
        "publisher": {
          "@id": "https://nuxtseo.com/#identity",
        },
        "thumbnailUrl": "https://emojiguide.org/images/emoji/n/3ep4zx1jztp0n.png",
      }
    `)
  })
})
