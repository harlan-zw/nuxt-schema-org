import type { Id, IdReference } from '@unhead/schema-org'
import { withoutTrailingSlash } from 'ufo'

interface LocaleIdentityRelationInput {
  currentPath: string
  homePath: string
  identityId?: Id
}

export function isLocaleHomePage(currentPath: string, homePath: string) {
  return withoutTrailingSlash(currentPath) === withoutTrailingSlash(homePath)
}

export function resolveLocaleIdentityRelation({ currentPath, homePath, identityId }: LocaleIdentityRelationInput): IdReference | undefined {
  if (!identityId || !isLocaleHomePage(currentPath, homePath))
    return

  return { '@id': identityId }
}
