import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'
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
