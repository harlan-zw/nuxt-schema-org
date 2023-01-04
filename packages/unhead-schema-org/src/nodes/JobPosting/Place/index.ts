import type { NodeRelation, Thing } from '../../../types'
import { defineSchemaOrgResolver, resolveRelation } from '../../../core'
import type { PostalAddress } from '../PostalAddress'
import { postalAddressResolver } from '../PostalAddress'

export interface PlaceSimple extends Thing {
  '@type'?: 'Place'
  name?: string
  address?: NodeRelation<PostalAddress | string>
  latitude?: number
  longitude?: number
}

export interface Place extends PlaceSimple {}

/**
 * Describes a HowTo guide, which contains a series of steps.
 */
export const placeResolver = defineSchemaOrgResolver<Place>({
  defaults: {
    '@type': 'Place',
  },
  resolve(node, ctx) {
    node.address = resolveRelation(node.address, ctx, postalAddressResolver)
    return node
  },
})
