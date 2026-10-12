import NuxtSchemaOrg from 'nuxt-schema-org'
import NuxtSiteConfig from 'nuxt-site-config'

export default defineNuxtConfig({
  workspaceDir: import.meta.dirname,
  vite: { resolve: { dedupe: ['nuxt', 'vue', 'vue-router'] } },
  modules: [NuxtSiteConfig, NuxtSchemaOrg],
  schemaOrg: {
    debug: true,
  },
  site: {
    name: 'Nuxt 5 Schema Org',
    url: 'https://schema-org.example.com',
  },
  compatibilityDate: '2026-06-10',
})
