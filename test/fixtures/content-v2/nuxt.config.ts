import NuxtSchemaOrg from '../../../src/module'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    NuxtSchemaOrg,
    '@nuxt/content',
  ],

  site: {
    url: 'https://nuxtseo.com',
  },

  devtools: { enabled: true },
  compatibilityDate: '2024-09-11',
})
