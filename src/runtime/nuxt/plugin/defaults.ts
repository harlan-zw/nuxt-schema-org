import type { Organization, Person } from '@unhead/schema-org'
import { defu } from 'defu'
import {
  defineNuxtPlugin,
  defineOrganization,
  definePerson,
  defineWebPage,
  defineWebSite,
  useSchemaOrg,
  useSiteConfig,
  useRuntimeConfig,
} from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:defaults',
  setup() {
    const runtimeConfig = useRuntimeConfig()['nuxt-schema-org'] || useRuntimeConfig().public['nuxt-schema-org']
    // get the head instance
    const siteConfig = useSiteConfig()

    // init vendors
    useSchemaOrg([
      defineWebSite({
        name: () => siteConfig?.name || '',
        // TODO integrate with nuxt/i18n
        inLanguage: () => siteConfig?.currentLocale || '',
        description: () => siteConfig?.description || '',
      }),
      defineWebPage(),
    ])
    if (runtimeConfig.identity || siteConfig.identity) {
      const identity = runtimeConfig.identity || siteConfig.identity
      let identityPayload: Person | Organization = {
        name: siteConfig.name,
        url: siteConfig.url,
      }
      let identityType = 'Organization'
      if (typeof identity !== 'string') {
        identityPayload = defu(identity, identityPayload)
        identityType = identity.type
      }
      else {
        identityType = identity
      }
      if (siteConfig.twitter) {
        // without the @
        const id = siteConfig.twitter.startsWith('@')
          ? siteConfig.twitter.slice(1)
          : siteConfig.twitter
        identityPayload.sameAs = [
          `https://twitter.com/${id}`,
        ]
      }
      useSchemaOrg([
        identityType === 'Person'
          ? definePerson(identityPayload)
          : defineOrganization(identityPayload),
      ])
    }
  },
})
