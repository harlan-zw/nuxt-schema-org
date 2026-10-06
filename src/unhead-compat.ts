import { existsSync } from 'node:fs'

function isPlainObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function cloneSerializableIdentityValue(value: unknown): unknown {
  if (typeof value === 'function')
    return undefined
  if (Array.isArray(value))
    return value.map(cloneSerializableIdentityValue).filter(value => typeof value !== 'undefined')
  if (!isPlainObject(value))
    return value

  const result: Record<string, any> = {}
  for (const [key, child] of Object.entries(value)) {
    if (key === '_resolver')
      continue
    const cloned = cloneSerializableIdentityValue(child)
    if (typeof cloned !== 'undefined')
      result[key] = cloned
  }
  return result
}

/**
 * Nuxt validates runtime config serializability during prepare. `definePerson`,
 * `defineOrganization`, etc. attach private `_resolver` methods to nodes, so
 * config.identity must be reduced to public serializable data before it is
 * copied into runtime config (#118).
 */
export function resolveSerializableIdentityConfig<T>(identity: T): T {
  if (!isPlainObject(identity))
    return identity

  const identityNode = identity as Record<string, any>
  const cloned = cloneSerializableIdentityValue(identityNode) as Record<string, any>
  const resolverDefaults = isPlainObject(identityNode._resolver?.defaults) ? identityNode._resolver.defaults : {}
  const resolvedType = Array.isArray(resolverDefaults['@type'])
    ? resolverDefaults['@type'].at(-1)
    : resolverDefaults['@type']

  if (resolvedType && !cloned.type && !cloned['@type'])
    cloned.type = resolvedType

  return cloned as T
}

export type SchemaOrgVendor
  = | { vendored: true, dir: string, main: string, vue: string }
    | { vendored: false, main: string, vue: string }

/** Published builds vendor Unhead 3; stub builds resolve the development package. */
export function schemaOrgVendor(resolve: (...path: string[]) => string): SchemaOrgVendor {
  const dir = resolve('./vendor/schema-org-v3')
  if (existsSync(dir))
    return { vendored: true, dir, main: `${dir}/index.mjs`, vue: `${dir}/vue.mjs` }
  const pkg = '@unhead/schema-org'
  return { vendored: false, main: pkg, vue: `${pkg}/vue` }
}
