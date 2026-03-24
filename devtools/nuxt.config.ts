import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  extends: ['nuxtseo-layer-devtools'],

  schemaOrg: false,

  nitro: {
    prerender: {
      routes: [
        '/',
        '/nodes',
        '/raw',
        '/debug',
        '/docs',
      ],
    },
    output: {
      publicDir: resolve('../dist/devtools'),
    },
  },

  app: {
    baseURL: '/__nuxt-schema-org',
  },
})
