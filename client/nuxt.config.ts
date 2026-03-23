import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  extends: ['nuxtseo-shared/layer-devtools'],
  nitro: {
    output: {
      publicDir: resolve('../dist/client'),
    },
  },
  app: {
    baseURL: '/__nuxt-schema-org',
  },
})
