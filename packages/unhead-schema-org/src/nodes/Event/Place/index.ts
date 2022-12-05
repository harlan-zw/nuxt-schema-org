import type { NodeRelation, Thing } from '../../../types'
import { defineSchemaOrgResolver, resolveRelation } from '../../../core'
import type { PostalAddress } from '../../PostalAddress'
import { addressResolver } from '../../PostalAddress'

export interface PlaceSimple extends Thing {
  '@type'?: 'Place'
  name: string
  address: NodeRelation<PostalAddress>
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
    node.address = resolveRelation(node.address, ctx, addressResolver)
    return node
  },
})
