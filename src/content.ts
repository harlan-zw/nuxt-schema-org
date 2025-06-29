import type { Collection } from '@nuxt/content'
import type { TypeOf, ZodRawShape } from 'zod'
import { z } from '@nuxt/content'

const SchemaOrgNode = z.record(z.string(), z.any())

export const schemaOrgSchema =  z.union([SchemaOrgNode, z.array(SchemaOrgNode).optional()]).optional()

export const schema = z.object({
  schemaOrg: schemaOrgSchema
})

const headSchema = z.object({
  head: z.object({
    meta: z.array(z.record(z.string(), z.any()).optional()),
    script: z.array(z.record(z.string(), z.any()).optional()),
  }).optional(),
})

export type SchemaOrgSchema = TypeOf<typeof schema>

type ExtendedSchema<T extends ZodRawShape> = T & {
  schemaOrg: typeof schemaOrgSchema
}

export function asSchemaOrgCollection<T extends ZodRawShape>(collection: Collection<T>): Collection<ExtendedSchema<T>> {
  if (collection.type === 'page') {
    // @ts-expect-error untyped
    collection.schema = collection.schema ? schema.extend(collection.schema.shape) : schema
    // check if the schema has a 'head' entry, if not we'll add it
    if (!('head' in collection.schema!.shape)) {
      collection.schema = headSchema.extend(collection.schema!.shape)
    }
  }
  return collection as Collection<ExtendedSchema<T>>
}
