export default defineNuxtConfig({
  modules: ['nuxt-schema-org'],

  site: {
    url: 'https://example.com',
    name: 'Compat v2',
    description: 'Unhead v2 compatibility fixture',
    identity: 'Organization',
  },

  schemaOrg: {
    // dev builds pretty-print by default, so dev.test.ts can see this option
    minify: true,
  },

  compatibilityDate: '2024-11-25',
})
