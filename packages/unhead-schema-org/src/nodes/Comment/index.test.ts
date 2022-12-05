import { expect } from 'vitest'
import { injectSchemaOrg, useSetup } from '../../../.test'
import { defineComment, useSchemaOrg } from '../../'

describe('defineComment', () => {
  it('can be registered', async () => {
    await useSetup(async () => {
      useSchemaOrg([
        defineComment({
          text: 'This is a comment',
          author: {
            name: 'Harlan Wilton',
          },
        }),
      ])

      const graphNodes = await injectSchemaOrg()
      expect(graphNodes).toMatchInlineSnapshot(`
        [
          {
            "@id": "https://example.com/#/schema/comment/V3foSKHFC7",
            "@type": "Comment",
            "author": {
              "@id": "https://example.com/#/schema/person/W64wIB7mRH",
            },
            "text": "This is a comment",
          },
          {
            "@id": "https://example.com/#/schema/person/W64wIB7mRH",
            "@type": "Person",
            "name": "Harlan Wilton",
          },
        ]
      `)
    })
  })
})
