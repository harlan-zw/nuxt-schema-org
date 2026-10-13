import { defineNuxtConfig } from 'nuxt/config'
import NuxtSchemaOrg from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    NuxtSchemaOrg,
  ],

  // Nitro deep freezes runtime config, so these nested objects reach the app frozen.
  site: {
    url: 'https://nuxtseo.com',
    name: 'Nuxt SEO',
    identity: {
      type: 'Organization',
      name: 'Nuxt SEO',
      address: {
        streetAddress: '1 Main Street',
        addressCountry: 'AU',
      },
      sameAs: ['https://github.com/harlan-zw'],
    },
  },

  compatibilityDate: '2024-11-25',
})
