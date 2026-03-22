import type { Collection } from '@nuxt/content'
import { createContentSchemaFactory } from 'nuxtseo-shared/content'
import { z } from 'zod'

const { defineSchema: defineSchemaOrgSchema, schema } = createContentSchemaFactory({
  fieldName: 'schemaOrg',
  label: 'schema-org',
  docsUrl: 'https://nuxtseo.com/schema-org/guides/content',
  buildSchema: (_z) => {
    const node = _z.record(_z.string(), _z.any())
    return _z.union([node, _z.array(node).optional()]).optional()
  },
}, z)

export { defineSchemaOrgSchema, schema }

// Legacy exports
export const schemaOrgSchema = schema.shape.schemaOrg

const headSchema = z.object({
  head: z.object({
    meta: z.array(z.record(z.string(), z.any()).optional()),
    script: z.array(z.record(z.string(), z.any()).optional()),
  }).optional(),
})

/** @deprecated Use `defineSchemaOrgSchema()` in your collection schema instead. See https://nuxtseo.com/schema-org/guides/content */
export function asSchemaOrgCollection<T>(collection: Collection<T>): Collection<T> {
  console.warn('[schema-org] `asSchemaOrgCollection()` is deprecated. Use `defineSchemaOrgSchema()` in your collection schema instead. See https://nuxtseo.com/schema-org/guides/content')
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
