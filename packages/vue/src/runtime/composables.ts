import type { MaybeComputedRefOrPromise } from '@unhead/vue'
import { useHead } from '@unhead/vue'
import type {
  AggregateOffer,
  AggregateRating,
  Article,
  Book,
  BookEdition,
  BreadcrumbList,
  Comment,
  Course,
  Event,
  HowTo,
  HowToStep,
  ImageObject,
  ItemList,
  LocalBusiness,
  Movie,
  Offer,
  OpeningHoursSpecification,
  Organization,
  Person,
  Place,
  PostalAddress,
  Product,
  Question,
  ReadAction,
  Recipe,
  Review,
  SearchAction,
  SoftwareApp,
  VideoObject,
  VirtualLocation,
  WebPage,
  WebSite,
} from '@unhead/schema-org'

export type DeepMaybeRef<T> = {
  [key in keyof T]?: MaybeComputedRefOrPromise<T[key]>
}

const provideResolver = <T>(input?: T, resolver?: string) => {
  if (!input)
    input = {} as T
  // avoid unreferring by wrapping it in a function
  // @ts-expect-error untyped
  input._resolver = resolver
  return input
}

export const defineAddress = <T extends Record<string, any>>(input?: DeepMaybeRef<PostalAddress & T>) => provideResolver(input, 'address')
export const defineAggregateOffer = <T extends Record<string, any>>(input?: DeepMaybeRef<AggregateOffer & T>) => provideResolver(input, 'aggregateOffer')
export const defineAggregateRating = <T extends Record<string, any>>(input?: DeepMaybeRef<AggregateRating & T>) => provideResolver(input, 'aggregateRating')
export const defineArticle = <T extends Record<string, any>>(input?: DeepMaybeRef<Article & T>) => provideResolver(input, 'article')
export const defineBreadcrumb = <T extends Record<string, any>>(input?: DeepMaybeRef<BreadcrumbList & T>) => provideResolver(input, 'breadcrumb')
export const defineComment = <T extends Record<string, any>>(input?: DeepMaybeRef<Comment & T>) => provideResolver(input, 'comment')
export const defineEvent = <T extends Record<string, any>>(input?: DeepMaybeRef<Event & T>) => provideResolver(input, 'event')
export const defineVirtualLocation = <T extends Record<string, any>>(input?: DeepMaybeRef<VirtualLocation & T>) => provideResolver(input, 'virtualLocation')
export const definePlace = <T extends Record<string, any>>(input?: DeepMaybeRef<Place & T>) => provideResolver(input, 'place')
export const defineHowTo = <T extends Record<string, any>>(input?: DeepMaybeRef<HowTo & T>) => provideResolver(input, 'howTo')
export const defineHowToStep = <T extends Record<string, any>>(input?: DeepMaybeRef<HowToStep & T>) => provideResolver(input, 'howToStep')
export const defineImage = <T extends Record<string, any>>(input?: DeepMaybeRef<ImageObject & T>) => provideResolver(input, 'image')
export const defineLocalBusiness = <T extends Record<string, any>>(input?: DeepMaybeRef<LocalBusiness & T>) => provideResolver(input, 'localBusiness')
export const defineOffer = <T extends Record<string, any>>(input?: DeepMaybeRef<Offer & T>) => provideResolver(input, 'offer')
export const defineOpeningHours = <T extends Record<string, any>>(input?: DeepMaybeRef<OpeningHoursSpecification & T>) => provideResolver(input, 'openingHours')
export const defineOrganization = <T extends Record<string, any>>(input?: DeepMaybeRef<Organization & T>) => provideResolver(input, 'organization')
export const definePerson = <T extends Record<string, any>>(input?: DeepMaybeRef<Person & T>) => provideResolver(input, 'person')
export const defineProduct = <T extends Record<string, any>>(input?: DeepMaybeRef<Product & T>) => provideResolver(input, 'product')
export const defineQuestion = <T extends Record<string, any>>(input?: DeepMaybeRef<Question & T>) => provideResolver(input, 'question')
export const defineRecipe = <T extends Record<string, any>>(input?: DeepMaybeRef<Recipe & T>) => provideResolver(input, 'recipe')
export const defineReview = <T extends Record<string, any>>(input?: DeepMaybeRef<Review & T>) => provideResolver(input, 'review')
export const defineVideo = <T extends Record<string, any>>(input?: DeepMaybeRef<VideoObject & T>) => provideResolver(input, 'video')
export const defineWebPage = <T extends Record<string, any>>(input?: DeepMaybeRef<WebPage & T>) => provideResolver(input, 'webPage')
export const defineWebSite = <T extends Record<string, any>>(input?: DeepMaybeRef<WebSite & T>) => provideResolver(input, 'webSite')
export const defineBook = <T extends Record<string, any>>(input?: DeepMaybeRef<Book & T>) => provideResolver(input, 'book')
export const defineCourse = <T extends Record<string, any>>(input?: DeepMaybeRef<Course & T>) => provideResolver(input, 'course')
export const defineItemList = <T extends Record<string, any>>(input?: DeepMaybeRef<ItemList & T>) => provideResolver(input, 'itemList')
export const defineMovie = <T extends Record<string, any>>(input?: DeepMaybeRef<Movie & T>) => provideResolver(input, 'movie')
export const defineSearchAction = <T extends Record<string, any>>(input?: DeepMaybeRef<SearchAction & T>) => provideResolver(input, 'searchAction')
export const defineReadAction = <T extends Record<string, any>>(input?: DeepMaybeRef<ReadAction & T>) => provideResolver(input, 'readAction')
export const defineSoftwareApp = <T extends Record<string, any>>(input?: DeepMaybeRef<SoftwareApp & T>) => provideResolver(input, 'softwareApp')
export const defineBookEdition = <T extends Record<string, any>>(input?: DeepMaybeRef<BookEdition & T>) => provideResolver(input, 'bookEdition')

type Arrayable<T> = T | Array<T>

export function useSchemaOrg(input?: Arrayable<any>): any {
  return useHead({
    script: [
      {
        type: 'application/ld+json',
        key: 'schema-org-graph',
        // @ts-expect-error runtime type
        nodes: input,
      },
    ],
  })
}
