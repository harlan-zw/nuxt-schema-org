import { defineNuxtPlugin, injectHead, useError } from 'nuxt/app'
import { deferSchemaOrgInit, initPlugin } from '../utils/shared'
import { warnOnUntypedSchemaOrgNodes } from '../utils/untyped-nodes'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:init',
  setup(nuxtApp) {
    const init = () => {
      initPlugin(nuxtApp)
      if (import.meta.dev)
        warnOnUntypedSchemaOrgNodes(injectHead(nuxtApp))
    }
    if (useError().value) {
      deferSchemaOrgInit(nuxtApp, init)
      return
    }
    init()
  },
})
