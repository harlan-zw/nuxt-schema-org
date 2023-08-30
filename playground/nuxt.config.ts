import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'
import Module from '../src/module'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  modules: [
    Module,
    'nuxt-windicss',
  ],

  site: {
    url: 'https://example.com',
  },

  build: {
    transpile: ['@unhead/schema-org-vue'],
  },

  nitro: {
    prerender: {
      crawlLinks: true,
    },
  },
})
