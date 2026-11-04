import { resolve } from 'node:path'
import { setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { $fetchSchemaOrg } from './utils'

await setup({
  rootDir: resolve(import.meta.dirname, '../fixtures/comark-content'),
  server: true,
  browser: false,
})

describe('comark-content', () => {
  it('renders FAQ content from storage in the built server', async () => {
    const schema = await $fetchSchemaOrg('/question-answer')
    expect(schema['@graph']).toContainEqual(expect.objectContaining({
      '@type': 'FaqPage',
      'mainEntity': expect.arrayContaining([
        expect.objectContaining({
          '@type': 'Question',
          'name': 'What is your return policy?',
          'acceptedAnswer': expect.objectContaining({
            '@type': 'Answer',
            'text': 'You can return any item within 30 days of purchase.',
          }),
        }),
      ]),
    }))
  })

  it('renders the schemaOrg frontmatter into the graph', async () => {
    const schema = await $fetchSchemaOrg('/about')
    expect(schema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@id": "https://nuxtseo.com/#website",
            "@type": "WebSite",
            "description": "The quickest and easiest way to build Schema.org graphs for Nuxt.",
            "name": "nuxt-schema-org",
            "url": "https://nuxtseo.com/",
          },
          {
            "@id": "https://nuxtseo.com/about#webpage",
            "@type": [
              "AboutPage",
              "AboutPage",
            ],
            "description": "hello",
            "isPartOf": {
              "@id": "https://nuxtseo.com/#website",
            },
            "name": "About",
            "url": "https://nuxtseo.com/about",
          },
        ],
      }
    `)
  })
})
