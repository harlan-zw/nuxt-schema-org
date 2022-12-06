import { useHead } from 'unhead'
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
} from './nodes'

const provideResolver = <T>(input?: T, resolver?: string) => {
  if (!input)
    input = {} as T
  // avoid unreferring by wrapping it in a function
  // @ts-expect-error untyped
  input._resolver = resolver
  return input
}

export const defineAddress = <T extends Record<string, any>>(input?: PostalAddress & T) => provideResolver(input, 'address')
export const defineAggregateOffer = <T extends Record<string, any>>(input?: AggregateOffer & T) => provideResolver(input, 'aggregateOffer')
export const defineAggregateRating = <T extends Record<string, any>>(input?: AggregateRating & T) => provideResolver(input, 'aggregateRating')
export const defineArticle = <T extends Record<string, any>>(input?: Article & T) => provideResolver(input, 'article')
export const defineBreadcrumb = <T extends Record<string, any>>(input?: BreadcrumbList & T) => provideResolver(input, 'breadcrumb')
export const defineComment = <T extends Record<string, any>>(input?: Comment & T) => provideResolver(input, 'comment')
export const defineEvent = <T extends Record<string, any>>(input?: Event & T) => provideResolver(input, 'event')
export const defineVirtualLocation = <T extends Record<string, any>>(input?: VirtualLocation & T) => provideResolver(input, 'virtualLocation')
export const definePlace = <T extends Record<string, any>>(input?: Place & T) => provideResolver(input, 'place')
export const defineHowTo = <T extends Record<string, any>>(input?: HowTo & T) => provideResolver(input, 'howTo')
export const defineHowToStep = <T extends Record<string, any>>(input?: HowToStep & T) => provideResolver(input, 'howToStep')
export const defineImage = <T extends Record<string, any>>(input?: ImageObject & T) => provideResolver(input, 'image')
export const defineLocalBusiness = <T extends Record<string, any>>(input?: LocalBusiness & T) => provideResolver(input, 'localBusiness')
export const defineOffer = <T extends Record<string, any>>(input?: Offer & T) => provideResolver(input, 'offer')
export const defineOpeningHours = <T extends Record<string, any>>(input?: OpeningHoursSpecification & T) => provideResolver(input, 'openingHours')
export const defineOrganization = <T extends Record<string, any>>(input?: Organization & T) => provideResolver(input, 'organization')
export const definePerson = <T extends Record<string, any>>(input?: Person & T) => provideResolver(input, 'person')
export const defineProduct = <T extends Record<string, any>>(input?: Product & T) => provideResolver(input, 'product')
export const defineQuestion = <T extends Record<string, any>>(input?: Question & T) => provideResolver(input, 'question')
export const defineRecipe = <T extends Record<string, any>>(input?: Recipe & T) => provideResolver(input, 'recipe')
export const defineReview = <T extends Record<string, any>>(input?: Review & T) => provideResolver(input, 'review')
export const defineVideo = <T extends Record<string, any>>(input?: VideoObject & T) => provideResolver(input, 'video')
export const defineWebPage = <T extends Record<string, any>>(input?: WebPage & T) => provideResolver(input, 'webPage')
export const defineWebSite = <T extends Record<string, any>>(input?: WebSite & T) => provideResolver(input, 'webSite')
export const defineBook = <T extends Record<string, any>>(input?: Book & T) => provideResolver(input, 'book')
export const defineCourse = <T extends Record<string, any>>(input?: Course & T) => provideResolver(input, 'course')
export const defineItemList = <T extends Record<string, any>>(input?: ItemList & T) => provideResolver(input, 'itemList')
export const defineMovie = <T extends Record<string, any>>(input?: Movie & T) => provideResolver(input, 'movie')
export const defineSearchAction = <T extends Record<string, any>>(input?: SearchAction & T) => provideResolver(input, 'searchAction')
export const defineReadAction = <T extends Record<string, any>>(input?: ReadAction & T) => provideResolver(input, 'readAction')

/* simple-only */
export const defineSoftwareApp = <T extends Record<string, any>>(input?: SoftwareApp & T) => provideResolver(input, 'softwareApp')
export const defineBookEdition = <T extends Record<string, any>>(input?: BookEdition & T) => provideResolver(input, 'bookEdition')
/* end-simple-only */

export function useSchemaOrg(input?: any): any {
  return useHead({
    script: [
      {
        type: 'application/ld+json',
        key: 'schema-org-graph',
        nodes: input,
      },
    ],
  }, { mode: process.env.NODE_ENV === 'development' ? 'all' : 'server' })
}
