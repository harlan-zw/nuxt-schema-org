import { defineNuxtPlugin } from 'nuxt/app'
import { initPlugin } from '../utils/shared'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:init',
  setup(nuxtApp) {
    // @ts-expect-error untyped
    initPlugin(nuxtApp)
  },
})
