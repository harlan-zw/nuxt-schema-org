import NuxtSchemaOrg from 'nuxt-schema-org'
import NuxtSiteConfig from 'nuxt-site-config'

if (process.env.NUXT_TEST_LANE === 'nuxt5') {
  for (const module of [NuxtSchemaOrg, NuxtSiteConfig]) {
    const metadata = await module.getMeta()
    metadata.compatibility ||= {}
    metadata.compatibility.nuxt = `${metadata.compatibility.nuxt} || 5.0.0-2610052343-36eafab`
  }
}

export default defineNuxtConfig({
  future: { compatibilityVersion: process.env.NUXT_TEST_LANE === 'future5' ? 5 : undefined },
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
