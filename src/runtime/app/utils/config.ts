import type { ModuleRuntimeConfig } from '#schema-org/types'
import { defu } from 'defu'
import { useRuntimeConfig } from 'nuxt/app'

export function useSchemaOrgConfig() {
  const runtimeConfig = useRuntimeConfig()
  // @ts-expect-error untyped
  return defu(import.meta.client ? runtimeConfig.public['nuxt-schema-org'] : runtimeConfig['nuxt-schema-org'], {
    scriptAttributes: {},
  }) as ModuleRuntimeConfig
}
