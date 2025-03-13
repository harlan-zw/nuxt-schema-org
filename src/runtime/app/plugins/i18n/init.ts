import { defineNuxtPlugin } from 'nuxt/app'
import { initPlugin } from '../../utils/shared'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:init',
  order: 999,
  // @ts-expect-error untyped
  dependsOn: ['i18n:plugin'],
  setup(nuxtApp) {
    // @ts-expect-error untyped
    initPlugin(nuxtApp)
  },
})
