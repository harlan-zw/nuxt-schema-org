import { defineNuxtConfig } from 'nuxt/config'
import NuxtSchemaOrg from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    NuxtSchemaOrg,
  ],

  site: {
    url: 'https://nuxtseo.com',
    name: 'Nuxt SEO',
    description: 'The quickest and easiest way to build Schema.org graphs for Nuxt.',
  },

  compatibilityDate: '2024-11-25',
})
