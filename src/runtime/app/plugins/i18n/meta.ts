import { defineNuxtPlugin } from 'nuxt/app'
import { initSchemaOrgMeta } from '../../utils/shared'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:meta',
  dependsOn: [
    'nuxt-schema-org:init',
    // @ts-expect-error conditionally available from nuxt-site-config's i18n plugin
    'nuxt-site-config:i18n',
  ],
  setup() {
    initSchemaOrgMeta()
  },
})
