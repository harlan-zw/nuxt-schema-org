import {
  defineNuxtPlugin,
  defineWebPage,
  defineWebSite,
  useSchemaOrg,
  useSiteConfig,
} from '#imports'
import { maybeAddIdentitySchemaOrg } from '../utils/shared'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:defaults',
  dependsOn: [
    'nuxt-schema-org:init',
  ],
  setup() {
    // get the head instance
    const siteConfig = useSiteConfig()
    // init vendors
    useSchemaOrg([
      defineWebSite({
        name: siteConfig?.name || '',
        inLanguage: siteConfig?.currentLocale || '',
        description: siteConfig?.description || '',
      }),
      defineWebPage(),
    ])
    maybeAddIdentitySchemaOrg()
  },
})
