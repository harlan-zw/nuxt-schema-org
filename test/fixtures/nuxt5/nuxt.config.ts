import NuxtSchemaOrg from 'nuxt-schema-org'

export default defineNuxtConfig({
  modules: [NuxtSchemaOrg],
  schemaOrg: {
    debug: true,
  },
  site: {
    name: 'Nuxt 5 Schema Org',
    url: 'https://schema-org.example.com',
  },
  compatibilityDate: '2026-06-10',
})
