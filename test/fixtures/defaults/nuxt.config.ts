import { defineNuxtConfig } from 'nuxt/config'
import NuxtSchemaOrg from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    NuxtSchemaOrg,
  ],

  site: {
    url: 'https://nuxtseo.com',
    name: 'Nuxt SEO',
  },

  compatibilityDate: '2024-11-25',
})
