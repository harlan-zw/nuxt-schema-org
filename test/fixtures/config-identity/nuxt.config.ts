import { defineNuxtConfig } from 'nuxt/config'
import NuxtSchemaOrg from '../../../src/module'
import { definePerson } from '../../../src/schema'

export default defineNuxtConfig({
  modules: [
    NuxtSchemaOrg,
  ],

  site: {
    url: 'https://nuxtseo.com',
    name: 'Nuxt SEO',
  },

  schemaOrg: {
    identity: definePerson({
      name: 'Harlan',
      jobTitle: 'Software Engineer',
    }),
  },

  compatibilityDate: '2024-11-25',
})
