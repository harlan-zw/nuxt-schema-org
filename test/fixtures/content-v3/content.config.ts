import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { asSchemaOrgCollection } from '../../../src/content'

export default defineContentConfig({
  collections: {
    content: defineCollection(
      asSchemaOrgCollection({
        type: 'page',
        source: '**/*.md',
        schema: z.object({
          date: z.string().optional(),
        }),
      }),
    ),
  },
})
