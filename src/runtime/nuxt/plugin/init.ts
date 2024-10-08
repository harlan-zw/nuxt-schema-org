import { defineNuxtPlugin } from '#imports'
import { initPlugin } from '../util/shared'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:init',
  setup(nuxtApp) {
    initPlugin(nuxtApp)
  },
})
