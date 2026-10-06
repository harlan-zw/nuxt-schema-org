import { defineEventHandler } from 'nuxt/server'
import { getNitroOrigin } from '#site-config/server/composables/getNitroOrigin'
import { getSiteConfig } from '#site-config/server/composables/getSiteConfig'
import { useSchemaOrgConfig } from '../../utils/config'

export default defineEventHandler(async (e) => {
  const nitroOrigin = getNitroOrigin(e)
  const siteConfig = getSiteConfig(e)
  return {
    nitroOrigin,
    runtimeConfig: useSchemaOrgConfig(),
    siteConfig: {
      url: siteConfig.url,
    },
  }
})
