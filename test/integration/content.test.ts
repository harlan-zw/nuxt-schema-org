import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { $fetchSchemaOrg } from './utils'

await setup({
  rootDir: fileURLToPath(new URL('../fixtures/content-v3', import.meta.url)),
  server: true,
  browser: false,
})

describe('content', () => {
  it('render faq', async () => {
    const schema = await $fetchSchemaOrg('/question-answer')

    // Snapshot
    expect(schema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@id": "https://nuxtseo.com#website",
            "@type": "WebSite",
            "description": "The quickest and easiest way to build Schema.org graphs for Nuxt.",
            "name": "nuxt-schema-org",
            "url": "https://nuxtseo.com",
          },
          {
            "@id": "https://nuxtseo.com/question-answer#webpage",
            "@type": [
              "WebPage",
              "FaqPage",
            ],
            "description": "The quickest and easiest way to build Schema.org graphs for Nuxt.",
            "isPartOf": {
              "@id": "https://nuxtseo.com#website",
            },
            "mainEntity": [
              {
                "@type": "Question",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can return any item within 30 days of purchase.",
                },
                "name": "What is your return policy?",
              },
              {
                "@type": "Question",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, we offer 24/7 technical support.",
                },
                "name": "Do you offer technical support?",
              },
            ],
            "name": "FAQ",
            "potentialAction": [
              {
                "@type": "ReadAction",
                "target": [
                  "https://nuxtseo.com/question-answer",
                ],
              },
            ],
            "url": "https://nuxtseo.com/question-answer",
          },
        ],
      }
    `)
  })

  it('render blog', async () => {
    const schema = await $fetchSchemaOrg('/posts/bar')

    // Snapshot
    expect(schema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@id": "https://nuxtseo.com#website",
            "@type": "WebSite",
            "description": "The quickest and easiest way to build Schema.org graphs for Nuxt.",
            "name": "nuxt-schema-org",
            "url": "https://nuxtseo.com",
          },
          {
            "@id": "https://nuxtseo.com/posts/bar#webpage",
            "@type": "WebPage",
            "description": "The quickest and easiest way to build Schema.org graphs for Nuxt.",
            "isPartOf": {
              "@id": "https://nuxtseo.com#website",
            },
            "name": "bar",
            "potentialAction": [
              {
                "@type": "ReadAction",
                "target": [
                  "https://nuxtseo.com/posts/bar",
                ],
              },
            ],
            "url": "https://nuxtseo.com/posts/bar",
          },
          {
            "@id": "https://nuxtseo.com/posts/bar#/schema/blog-posting/346f916",
            "@type": "BlogPosting",
            "author": {
              "@type": "Person",
              "name": "Jane Smith",
            },
            "datePublished": "2023-10-01",
            "headline": "How to Use Our Product",
          },
        ],
      }
    `)
  })
})
