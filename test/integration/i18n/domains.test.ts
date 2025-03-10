import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { $fetchSchemaOrg } from '../utils'

await setup({
  rootDir: fileURLToPath(new URL('../../fixtures/i18n-domains', import.meta.url)),
  build: true,
  server: true,
})

describe('pages', () => {
  it('render index', async () => {
    const home = await $fetchSchemaOrg('/')
    expect(home).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@id": "http://en.nuxtseo.com/#website",
            "@type": "WebSite",
            "description": "The quickest and easiest way to build Schema.org graphs for Nuxt.",
            "inLanguage": "en-US",
            "name": "nuxt-schema-org",
            "publisher": {
              "@id": "http://en.nuxtseo.com/#identity",
            },
            "url": "http://en.nuxtseo.com/",
            "workTranslation": [
              {
                "@id": "http://jp.nuxtseo.com:3000/#website",
              },
              {
                "@id": "https://zh.nuxtseo.com/#website",
              },
            ],
          },
          {
            "@id": "http://en.nuxtseo.com/#webpage",
            "@type": "WebPage",
            "about": {
              "@id": "http://en.nuxtseo.com/#identity",
            },
            "description": "The quickest and easiest way to build Schema.org graphs for Nuxt.",
            "isPartOf": {
              "@id": "http://en.nuxtseo.com/#website",
            },
            "name": "Welcome",
            "potentialAction": [
              {
                "@type": "ReadAction",
                "target": [
                  "http://en.nuxtseo.com/",
                ],
              },
            ],
            "url": "http://en.nuxtseo.com/",
          },
          {
            "@id": "http://en.nuxtseo.com/#identity",
            "@type": "Organization",
            "name": "nuxt-schema-org",
            "url": "http://en.nuxtseo.com",
          },
        ],
      }
    `)
  })
})
