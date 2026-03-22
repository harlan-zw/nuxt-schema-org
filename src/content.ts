import type { Collection } from '@nuxt/content'
import { z } from 'zod'

function buildSchemaOrgObjectSchema(_z: typeof z) {
  const node = _z.record(_z.string(), _z.any())
  return _z.union([node, _z.array(node).optional()]).optional()
}

const schemaOrgObjectSchema = buildSchemaOrgObjectSchema(z)

function withEditorHidden<T extends z.ZodTypeAny>(s: T): T {
  // .editor() is patched onto ZodType by @nuxt/content at runtime
  if (typeof (s as any).editor === 'function')
    return (s as any).editor({ hidden: true })
  return s
}

export interface DefineSchemaOrgSchemaOptions {
  /**
   * Pass the `z` instance from `@nuxt/content` to ensure `.editor({ hidden: true })` works
   * across Zod versions. When omitted, the bundled `z` is used (`.editor()` applied if available).
   */
  z?: typeof z
}

/**
 * Define the schemaOrg schema field for a Nuxt Content collection.
 *
 * @example
 * defineCollection({
 *   type: 'page',
 *   source: '**',
 *   schema: z.object({
 *     schemaOrg: defineSchemaOrgSchema()
 *   })
 * })
 */
export function defineSchemaOrgSchema(options?: DefineSchemaOrgSchemaOptions) {
  const s = options?.z ? buildSchemaOrgObjectSchema(options.z) : schemaOrgObjectSchema
  return withEditorHidden(s)
}

// Legacy exports
export const schemaOrgSchema = withEditorHidden(schemaOrgObjectSchema)

export const schema = z.object({
  schemaOrg: schemaOrgSchema,
})

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
