import { useSiteConfig } from '#site-config/app/runtime/composables'
import { defineWebPage, defineWebSite } from '@unhead/schema-org/vue'
import { defineNuxtPlugin } from 'nuxt/app'
import { useSchemaOrg } from '../composables/useSchemaOrg'
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
