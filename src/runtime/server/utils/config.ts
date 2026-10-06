import type { ModuleRuntimeConfig } from '#schema-org/types'
import { defu } from 'defu'
import { useRuntimeConfig } from 'nuxt/server'

export function useSchemaOrgConfig() {
  const runtimeConfig = useRuntimeConfig()
  return defu(import.meta.client ? runtimeConfig.public['nuxt-schema-org'] : runtimeConfig['nuxt-schema-org'], {
    scriptAttributes: {},
  }) as ModuleRuntimeConfig
}
