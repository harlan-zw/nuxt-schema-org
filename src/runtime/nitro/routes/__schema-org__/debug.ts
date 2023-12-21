import { defineEventHandler } from 'h3'
import type { ModuleRuntimeConfig } from '../../../types'
import { useNitroOrigin, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (e) => {
  const runtimeConfig = (useRuntimeConfig()['nuxt-schema-org'] || useRuntimeConfig().public['nuxt-schema-org']) as any as ModuleRuntimeConfig
  const nitroOrigin = useNitroOrigin(e)
  return {
    nitroOrigin,
    runtimeConfig,
  }
})
