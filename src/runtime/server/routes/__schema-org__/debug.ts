import { useNitroOrigin } from '#site-config/server/composables/useNitroOrigin'
import { useSiteConfig } from '#site-config/server/composables/useSiteConfig'
import { defineEventHandler } from 'h3'
import { useSchemaOrgConfig } from '../../utils/config'

export default defineEventHandler(async (e) => {
  const nitroOrigin = useNitroOrigin(e)
  const siteConfig = useSiteConfig(e)
  return {
    nitroOrigin,
    runtimeConfig: useSchemaOrgConfig(e),
    siteConfig: {
      url: siteConfig.url,
    },
  }
})
