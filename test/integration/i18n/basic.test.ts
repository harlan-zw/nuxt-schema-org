import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { $fetchSchemaOrg } from '../utils'

await setup({
  rootDir: fileURLToPath(new URL('../../fixtures/i18n', import.meta.url)),
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
            "@id": "https://nuxtseo.com/en/#webpage",
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
            "@id": "https://nuxtseo.com/ja/#webpage",
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
})
