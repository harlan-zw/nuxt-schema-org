import { useNitroOrigin } from '#imports'
import { useSchemaOrgConfig } from '#schema-org/nuxt/util/shared'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (e) => {
  const nitroOrigin = useNitroOrigin(e)
  return {
    nitroOrigin,
    runtimeConfig: useSchemaOrgConfig(e),
  }
})
