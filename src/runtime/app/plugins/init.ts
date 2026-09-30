import { defineNuxtPlugin, injectHead } from 'nuxt/app'
import { initPlugin } from '../utils/shared'
import { warnOnUntypedSchemaOrgNodes } from '../utils/untyped-nodes'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:init',
  setup(nuxtApp) {
    initPlugin(nuxtApp)
    if (import.meta.dev)
      warnOnUntypedSchemaOrgNodes(injectHead(nuxtApp))
  },
})
