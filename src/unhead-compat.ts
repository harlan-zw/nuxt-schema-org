import { existsSync } from 'node:fs'
import { dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { readPackageJSON, resolvePackageJSON } from 'pkg-types'

export type UnheadMajor = 2 | 3

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

function normalizePackageUrl(rootDir: string): string {
  const url = rootDir.startsWith('file:')
    ? rootDir
    : pathToFileURL(rootDir.endsWith('/') ? rootDir : `${rootDir}/`).href
  return url.endsWith('/') ? url : `${url}/`
}

/**
 * `@unhead/schema-org` attaches an object `_resolver` to every graph node. Unhead
 * v3's `walkResolver` skips that key, but v2's walks into it and invokes the
 * resolver's `resolve()` method as an argument-less thunk, crashing with
 * "Cannot read properties of undefined (reading 'potentialAction')" (#114).
 *
 * Empirically schema-org v2 renders cleanly on unhead v2, and schema-org v3 on
 * unhead v3. So we ship both majors (`@unhead/schema-org` + the aliased
 * `@unhead/schema-org-v2`) and select the one matching the host's unhead.
 *
 * Returns the major of the unhead the host app renders with, falling back to the
 * module's primary major (3) when it can't be resolved.
 *
 * TODO: once nuxtseo-shared ships `resolveHostUnheadMajor` (nuxt-seo#561), import
 * it from `nuxtseo-shared/kit` and delete this local copy.
 */
export async function resolveHostUnheadMajor(rootDir: string): Promise<UnheadMajor> {
  const rootUrl = normalizePackageUrl(rootDir)
  // Search from the packages that own SSR before the app root. A host can have
  // @unhead/vue v3 installed at the project root while Nuxt/Nitro renders with
  // nested @unhead/vue v2; matching the root copy would still crash SSR (#114).
  const searchUrls = []
  for (const id of ['@nuxt/nitro-server', 'nuxt']) {
    const pkgJson = await resolvePackageJSON(id, { url: rootUrl }).catch(() => {
      // A missing package is an expected miss in non-standard layouts; keep
      // searching from the remaining candidates.
      return undefined
    })
    if (pkgJson)
      searchUrls.push(`${dirname(pkgJson)}/`)
  }
  searchUrls.push(rootUrl)
  // `@unhead/vue` is what schema-org actually peer-depends on; fall back to the
  // core `unhead` package when it isn't directly resolvable.
  for (const id of ['@unhead/vue', 'unhead']) {
    for (const url of searchUrls) {
      const version = await readPackageJSON(id, { url }).then(pkg => pkg.version).catch(() => {
        // an unresolvable package is an expected miss (not installed under this id
        // at this search root); fall through to the next candidate/root, then the
        // default major.
        return undefined
      })
      const major = version ? Number.parseInt(version, 10) : Number.NaN
      if (major === 2)
        return 2
      if (Number.isFinite(major) && major >= 3)
        return 3
    }
  }
  return 3
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
