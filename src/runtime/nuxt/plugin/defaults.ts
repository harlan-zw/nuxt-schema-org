import type { Organization, Person } from '@unhead/schema-org'
import { defu } from 'defu'
import {
  defineNuxtPlugin,
  defineOrganization,
  definePerson,
  defineWebPage,
  defineWebSite,
  useRuntimeConfig,
  useSchemaOrg,
  useSiteConfig,
} from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:defaults',
  setup() {
    const _config = useRuntimeConfig()
    const runtimeConfig = import.meta.client ? _config.public['nuxt-schema-org'] : (_config['nuxt-schema-org'] || _config.public['nuxt-schema-org'])
    // get the head instance
    const siteConfig = useSiteConfig()

    // we need a name by default
    if (!siteConfig?.name)
      return

    // init vendors
    useSchemaOrg([
      defineWebSite({
        name: siteConfig?.name || '',
        inLanguage: siteConfig?.currentLocale || '',
        description: siteConfig?.description || '',
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

        // Remove type from object to avoid invalid markup
        delete identityPayload.type
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
