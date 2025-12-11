import type { Collection } from '@nuxt/content'
import { z } from 'zod'

const SchemaOrgNode = z.record(z.string(), z.any())

export const schemaOrgSchema = z.union([SchemaOrgNode, z.array(SchemaOrgNode).optional()]).optional()

export const schema = z.object({
  schemaOrg: schemaOrgSchema,
})

const headSchema = z.object({
  head: z.object({
    meta: z.array(z.record(z.string(), z.any()).optional()),
    script: z.array(z.record(z.string(), z.any()).optional()),
  }).optional(),
})

export function asSchemaOrgCollection<T>(collection: Collection<T>): Collection<T> {
  if (collection.type === 'page') {
    // @ts-expect-error untyped
    collection.schema = collection.schema ? schema.extend(collection.schema.shape) : schema
    // check if the schema has a 'head' entry, if not we'll add it
    // @ts-expect-error untyped
    if (!('head' in collection.schema!.shape)) {
      // @ts-expect-error untyped
      collection.schema = headSchema.extend(collection.schema!.shape)
    }
  }
  return collection
}
