import { readPackageJSON } from 'pkg-types'

export type UnheadMajor = 2 | 3

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
 */
export async function resolveHostUnheadMajor(rootDir: string): Promise<UnheadMajor> {
  const url = rootDir.endsWith('/') ? rootDir : `${rootDir}/`
  // `@unhead/vue` is what schema-org actually peer-depends on; fall back to the
  // core `unhead` package when it isn't directly resolvable.
  for (const id of ['@unhead/vue', 'unhead']) {
    const version = await readPackageJSON(id, { url }).then(pkg => pkg.version).catch(() => {
      // an unresolvable package is an expected miss (it just isn't installed under
      // this id); fall through to the next candidate, then the default major.
      return undefined
    })
    const major = version ? Number.parseInt(version, 10) : Number.NaN
    if (major === 2)
      return 2
    if (Number.isFinite(major) && major >= 3)
      return 3
  }
  return 3
}

/**
 * Package specifiers for the vendored schema-org major matching the host unhead.
 * The aliased `@unhead/schema-org-v2` resolves to `@unhead/schema-org@2`.
 */
export function schemaOrgVendor(major: UnheadMajor): { main: string, vue: string } {
  const pkg = major === 2 ? '@unhead/schema-org-v2' : '@unhead/schema-org'
  return { main: pkg, vue: `${pkg}/vue` }
}
