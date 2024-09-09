import { defineNuxtPlugin } from '#imports'
import { initPlugin } from '../../util/shared'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:init',
  order: 999,
  dependsOn: ['i18n:plugin'],
  setup(nuxtApp) {
    initPlugin(nuxtApp)
  },
})
