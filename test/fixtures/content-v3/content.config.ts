import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'
import { defineSchemaOrgSchema } from '../../../src/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        date: z.string().optional(),
        schemaOrg: defineSchemaOrgSchema(),
        head: z.object({
          meta: z.array(z.record(z.string(), z.any())).optional(),
          script: z.array(z.record(z.string(), z.any())).optional(),
        }).optional(),
      }),
    }),
  },
})
