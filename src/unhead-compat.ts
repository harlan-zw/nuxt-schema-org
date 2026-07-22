import type { UnheadMajor } from './kit'
import { existsSync } from 'node:fs'

export type { UnheadMajor } from './kit'

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

/**
 * Module specifiers for the schema-org major matching the host unhead.
 *
 * Published builds carry both majors' dist files under `dist/vendor/` and no
 * `@unhead/schema-org*` dependency: the npm-aliased `@unhead/schema-org-v2`
 * dep 404s on registries/buildpacks without `npm:` alias support, and the v3
 * copy's optional peer on `@unhead/vue@^3` marks Nuxt's unhead v2 tree invalid
 * (#125). Vendored entries are absolute file paths.
 *
 * In this repo's dev/stub mode `dist/vendor` doesn't exist, so fall back to
 * the bare packages from the workspace devDependencies (`@unhead/schema-org-v2`
 * resolves to `@unhead/schema-org@2` via npm alias).
 */
export function schemaOrgVendor(major: UnheadMajor, resolve: (...path: string[]) => string): SchemaOrgVendor {
  const dir = resolve(`./vendor/schema-org-v${major}`)
  if (existsSync(dir))
    return { vendored: true, dir, main: `${dir}/index.mjs`, vue: `${dir}/vue.mjs` }
  const pkg = major === 2 ? '@unhead/schema-org-v2' : '@unhead/schema-org'
  return { vendored: false, main: pkg, vue: `${pkg}/vue` }
}
