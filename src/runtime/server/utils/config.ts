import type { ModuleRuntimeConfig } from '#schema-org/types'
import type { H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import { defu } from 'defu'

export function useSchemaOrgConfig(e?: H3Event) {
  const runtimeConfig = useRuntimeConfig(e)
  return defu(import.meta.client ? runtimeConfig.public['nuxt-schema-org'] : runtimeConfig['nuxt-schema-org'], {
    scriptAttributes: {},
  }) as ModuleRuntimeConfig
}
