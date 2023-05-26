import { describe, it } from 'vitest'
import { createHead } from 'unhead'
import { SchemaOrgUnheadPlugin, defineQuestion, defineWebPage, useSchemaOrg } from '../../packages/unhead-schema-org/src'

describe('core e2e', () => {
  it('faq', async () => {
    const ssrHead = createHead({
      plugins: [
        SchemaOrgUnheadPlugin({
          host: 'https://example.com',
        }, () => ({})),
      ],
    })

    useSchemaOrg([
      defineWebPage(),
    ])

    // i.e App.vue
    useSchemaOrg([
      defineWebPage({
        '@type': 'FAQPage',
      }),
      defineQuestion({
        name: 'How long is a piece of string?',
        acceptedAnswer: 'The length of a piece of string is the number of characters in the string.',
      }),
      defineQuestion({
        name: 'How big is a giraffe?',
        acceptedAnswer: 'A giraffe is 12 feet tall',
      }),
    ])

    expect(await ssrHead.resolveTags()).toMatchInlineSnapshot(`
      [
        {
          "_d": "script:schema-org-graph",
          "_e": 1,
          "_h": "3437552",
          "_p": 1024,
          "innerHTML": "{
        \\"@context\\": \\"https://schema.org\\",
        \\"@graph\\": [
          {
            \\"@id\\": \\"https://example.com/#webpage\\",
            \\"url\\": \\"https://example.com\\",
            \\"@type\\": [
              \\"WebPage\\",
              \\"FAQPage\\"
            ],
            \\"mainEntity\\": [
              {
                \\"@id\\": \\"https://example.com/#/schema/question/e2a0a92\\"
              },
              {
                \\"@id\\": \\"https://example.com/#/schema/question/543d638\\"
              }
            ],
            \\"potentialAction\\": [
              {
                \\"@type\\": \\"ReadAction\\",
                \\"target\\": [
                  \\"https://example.com\\"
                ]
              }
            ]
          },
          {
            \\"@id\\": \\"https://example.com/#/schema/question/e2a0a92\\",
            \\"@type\\": \\"Question\\",
            \\"name\\": \\"How long is a piece of string?\\",
            \\"acceptedAnswer\\": {
              \\"@type\\": \\"Answer\\",
              \\"text\\": \\"The length of a piece of string is the number of characters in the string.\\"
            }
          },
          {
            \\"@id\\": \\"https://example.com/#/schema/question/543d638\\",
            \\"@type\\": \\"Question\\",
            \\"name\\": \\"How big is a giraffe?\\",
            \\"acceptedAnswer\\": {
              \\"@type\\": \\"Answer\\",
              \\"text\\": \\"A giraffe is 12 feet tall\\"
            }
          }
        ]
      }",
          "key": "schema-org-graph",
          "props": {
            "data-h-3437552": "",
            "type": "application/ld+json",
          },
          "tag": "script",
          "tagPosition": "bodyClose",
        },
      ]
    `)
  })
})
