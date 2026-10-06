import NuxtSchemaOrg from 'nuxt-schema-org'
import NuxtSiteConfig from 'nuxt-site-config'
import NuxtSeoShared from 'nuxtseo-shared'

for (const module of [NuxtSchemaOrg, NuxtSiteConfig, NuxtSeoShared]) {
  const metadata = await module.getMeta()
  metadata.compatibility ||= {}
  metadata.compatibility.nuxt = `${metadata.compatibility.nuxt} || 5.0.0-2610061032-c7ad8cd`
}

export default defineNuxtConfig({
  workspaceDir: import.meta.dirname,
  vite: { resolve: { dedupe: ['nuxt', 'vue', 'vue-router'] } },
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
