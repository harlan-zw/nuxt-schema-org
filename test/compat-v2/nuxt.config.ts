export default defineNuxtConfig({
  modules: ['nuxt-schema-org'],

  site: {
    url: 'https://example.com',
    name: 'Compat v2',
    description: 'Unhead v2 compatibility fixture',
    identity: 'Organization',
  },

  compatibilityDate: '2024-11-25',
})
