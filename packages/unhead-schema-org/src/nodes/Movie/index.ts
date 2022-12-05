import type {
  NodeRelation,
  NodeRelations,
  ResolvableDate,
  Thing,
} from '../../types'
import { resolvableDateToDate } from '../../utils'
import { defineSchemaOrgResolver, resolveRelation } from '../../core'
import type { ImageObject } from '../Image'
import type { AggregateRating } from '../AggregateRating'
import { aggregateRatingResolver } from '../AggregateRating'
import type { Person } from '../Person'
import { personResolver } from '../Person'
import type { Review } from '../Review'
import { reviewResolver } from '../Review'

export interface MovieSimple extends Thing {
  /**
   * An image that represents the movie.
   */
  image: NodeRelations<string | ImageObject>
  /**
   * The name of the movie.
   */
  name: string
  /**
   * Annotation for the average review score assigned to the movie.
   */
  aggregateRating?: NodeRelation<AggregateRating>
  /**
   * The date the movie was released.
   */
  dateCreated?: ResolvableDate
  /**
   * The director of the movie.
   */
  director?: NodeRelation<Person | string>
  /**
   * A nested Review of the movie.
   */
  review?: NodeRelations<Review>
}

export interface Movie extends MovieSimple {}

export const movieResolver = defineSchemaOrgResolver<Movie>({
  defaults: {
    '@type': 'Movie',
  },
  resolve(node, ctx) {
    node.aggregateRating = resolveRelation(node.aggregateRating, ctx, aggregateRatingResolver)
    node.review = resolveRelation(node.review, ctx, reviewResolver)
    node.director = resolveRelation(node.director, ctx, personResolver)
    if (node.dateCreated)
      node.dateCreated = resolvableDateToDate(node.dateCreated)
    return node
  },
})
