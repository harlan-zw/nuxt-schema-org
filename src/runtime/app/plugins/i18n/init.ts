import { defineNuxtPlugin } from 'nuxt/app'
import { initSchemaOrgHead } from '../../utils/shared'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:init',
  // @ts-expect-error untyped
  dependsOn: ['i18n:plugin'],
  setup(nuxtApp) {
    initSchemaOrgHead(nuxtApp)
  },
})
