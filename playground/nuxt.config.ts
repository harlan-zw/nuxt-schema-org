import { defineNuxtConfig } from 'nuxt/config'
import Module from '../src/module'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  modules: [
    Module,
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxtjs/robots',
  ],

  // @ts-expect-error i18n config is added by the module at runtime.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
  },

  site: {
    url: 'https://harlanhamburgers.com',
    identity: {
      type: 'Organization',
      name: 'Harlan Hamburgers',
    },
  },

  schemaOrg: {
    scriptAttributes: {
      'tagPosition': 'head',
      'tagPriority': 0,
      'id': 'schema-org-graph',
      'data-foo': 'bar',
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: false,
    },
  },

  compatibilityDate: '2024-09-10',
})
