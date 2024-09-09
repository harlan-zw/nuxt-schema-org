import { useNitroOrigin, useRuntimeConfig } from '#imports'
import { defineEventHandler } from 'h3'
import type { ModuleRuntimeConfig } from '../../../types'

export default defineEventHandler(async (e) => {
  const _config = useRuntimeConfig()
  const runtimeConfig = (import.meta.client ? _config.public['nuxt-schema-org'] : (_config['nuxt-schema-org'] || _config.public['nuxt-schema-org'])) as any as ModuleRuntimeConfig
  const nitroOrigin = useNitroOrigin(e)
  return {
    nitroOrigin,
    runtimeConfig,
  }
})
