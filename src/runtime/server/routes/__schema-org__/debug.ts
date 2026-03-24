import { getNitroOrigin } from '#site-config/server/composables/getNitroOrigin'
import { getSiteConfig } from '#site-config/server/composables/getSiteConfig'
import { defineEventHandler } from 'h3'
import { useSchemaOrgConfig } from '../../utils/config'

export default defineEventHandler(async (e) => {
  const nitroOrigin = getNitroOrigin(e)
  const siteConfig = getSiteConfig(e)
  return {
    nitroOrigin,
    runtimeConfig: useSchemaOrgConfig(e),
    siteConfig: {
      url: siteConfig.url,
    },
  }
})
