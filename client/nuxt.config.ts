import DevtoolsUIKit from '@nuxt/devtools-ui-kit'
import { createResolver } from '@nuxt/kit'

const resolver = createResolver(import.meta.url)

export default defineNuxtConfig({
  ssr: false,

  modules: [
    DevtoolsUIKit,
  ],

  devtools: {
    enabled: false,
  },

  nitro: {
    output: {
      publicDir: resolver.resolve('../dist/client'),
    },
  },

  app: {
    baseURL: '/__nuxt-schema-org',
  },

  compatibilityDate: '2024-09-06',
})
