import NuxtSchemaOrg from '../../../src/module'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    NuxtSchemaOrg,
    '@nuxt/content',
  ],

  site: {
    url: 'https://nuxtseo.com',
    description: 'The quickest and easiest way to build Schema.org graphs for Nuxt.',
  },

  devtools: { enabled: true },
  compatibilityDate: '2024-09-11',
})
