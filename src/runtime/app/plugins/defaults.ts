import { useSiteConfig } from '#site-config/app/composables/useSiteConfig'
import { defineWebPage, defineWebSite } from '@unhead/schema-org/vue'
import { defineNuxtPlugin } from 'nuxt/app'
import { toValue } from 'vue'
import { useSchemaOrg } from '../composables/useSchemaOrg'
import { maybeAddIdentitySchemaOrg } from '../utils/shared'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:defaults',
  dependsOn: [
    'nuxt-schema-org:init',
  ],
  setup() {
    // get the head instance
    const siteConfig = useSiteConfig({
      resolveRefs: true,
    })
    // init vendors
    useSchemaOrg([
      defineWebSite({
        name: toValue(siteConfig.name) || '',
        inLanguage: toValue(siteConfig.currentLocale) || '',
        description: toValue(siteConfig.description) || '',
      }),
      defineWebPage(),
    ])
    maybeAddIdentitySchemaOrg()
  },
})
