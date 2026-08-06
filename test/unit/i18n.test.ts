import { describe, expect, it } from 'vitest'
import { isLocaleHomePage, resolveLocaleIdentityRelation } from '../../src/runtime/app/utils/i18n'

describe('isLocaleHomePage', () => {
  it.each([
    ['/en', '/en', true],
    ['/en/', '/en', true],
    ['/', '/', true],
    ['/ja', '/en', false],
    ['/en/about', '/en', false],
  ])('compares %s with locale home %s', (currentPath, homePath, expected) => {
    expect(isLocaleHomePage(currentPath, homePath)).toBe(expected)
  })

  it('returns the identity relation only on the locale home', () => {
    const identityId = 'https://example.com/#identity' as const

    expect(resolveLocaleIdentityRelation({ currentPath: '/en', homePath: '/en/', identityId }))
      .toEqual({ '@id': identityId })
    expect(resolveLocaleIdentityRelation({ currentPath: '/en/about', homePath: '/en', identityId }))
      .toBeUndefined()
    expect(resolveLocaleIdentityRelation({ currentPath: '/en', homePath: '/en' }))
      .toBeUndefined()
  })
})
