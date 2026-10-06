import { defineLocalBusiness, definePerson } from '@unhead/schema-org'
import { describe, expect, it } from 'vitest'
import { resolveSerializableIdentityConfig } from '../../src/unhead-compat'

describe('resolveSerializableIdentityConfig', () => {
  it('removes private resolver functions from defineX identity config', () => {
    const identity = resolveSerializableIdentityConfig(definePerson({
      name: 'Harlan',
      sameAs: ['https://github.com/harlan-zw'],
    }))

    expect(identity).toEqual({
      type: 'Person',
      name: 'Harlan',
      sameAs: ['https://github.com/harlan-zw'],
    })
    expect(identity).not.toHaveProperty('_resolver')
  })

  it('uses the most specific resolver default type', () => {
    const identity = resolveSerializableIdentityConfig(defineLocalBusiness({
      name: 'Harlan Hamburgers',
      address: {
        streetAddress: '1 Example Street',
        postalCode: '3000',
        addressCountry: 'AU',
      },
    }))

    expect(identity).toEqual({
      type: 'LocalBusiness',
      name: 'Harlan Hamburgers',
      address: {
        streetAddress: '1 Example Street',
        postalCode: '3000',
        addressCountry: 'AU',
      },
    })
  })

  it('does not mutate the original identity node', () => {
    const identity = definePerson({ name: 'Harlan' })

    resolveSerializableIdentityConfig(identity)

    expect(identity._resolver?.resolve).toBeTypeOf('function')
  })
})
