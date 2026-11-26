import { defineNuxtPlugin, useError } from 'nuxt/app'
import { deferSchemaOrgInit, initSchemaOrgHead } from '../../utils/shared'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:init',
  // @ts-expect-error untyped
  dependsOn: ['i18n:plugin'],
  setup(nuxtApp) {
    if (useError().value) {
      deferSchemaOrgInit(nuxtApp, () => initSchemaOrgHead(nuxtApp))
      return
    }
    initSchemaOrgHead(nuxtApp)
  },
})
