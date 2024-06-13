import type { useSchemaOrg as _useSchemaOrg } from '@unhead/schema-org/vue'
import type { ActiveHeadEntry } from '@unhead/schema'
import type { ModuleRuntimeConfig, UnheadAugmentation } from '../../types'
import { useHead, useRuntimeConfig, useServerHead } from '#imports'

type Input = Parameters<typeof _useSchemaOrg>[0]
export function useSchemaOrg<T extends Input>(input: T): ActiveHeadEntry<UnheadAugmentation<T>> | void {
  const _config = useRuntimeConfig()
  const config = (import.meta.client ? _config.public['nuxt-schema-org'] : (_config['nuxt-schema-org'] || _config.public['nuxt-schema-org'])) as ModuleRuntimeConfig
  const script = {
    type: 'application/ld+json',
    key: 'schema-org-graph',
    nodes: input,
    ...config?.scriptAttributes || {},
  }
  if (import.meta.server) {
    // we don't need to use the direct composable as the plugin is already registered
    return useServerHead<UnheadAugmentation<T>>({
      script: [script],
    })
  }
  else {
    if (config?.reactive) {
      return useHead<UnheadAugmentation<T>>({
        script: [script],
      })
    }
  }
}
