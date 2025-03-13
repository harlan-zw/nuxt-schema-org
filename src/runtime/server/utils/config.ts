import type { ModuleRuntimeConfig } from '#schema-org/types'
import type { H3Event } from 'h3'
import { defu } from 'defu'
import { useRuntimeConfig } from 'nitropack/runtime'

export function useSchemaOrgConfig(e?: H3Event) {
  const runtimeConfig = useRuntimeConfig(e)
  // @ts-expect-error untyped
  return defu(import.meta.client ? runtimeConfig.public['nuxt-schema-org'] : runtimeConfig['nuxt-schema-org'], {
    scriptAttributes: {},
  }) as ModuleRuntimeConfig
}
