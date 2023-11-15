import type { useSchemaOrg as _useSchemaOrg } from '@unhead/schema-org/vue'
import { useHead, useRuntimeConfig, useServerHead } from '#imports'

type Input = Parameters<typeof _useSchemaOrg>[0]
export function useSchemaOrg(input: Input) {
  const script = {
    type: 'application/ld+json',
    key: 'schema-org-graph',
    nodes: input,
  }
  if (import.meta.server) {
    // we don't need to use the direct composable as the plugin is already registered
    return useServerHead<{ script: { nodes: Input } }>({
      script: [script],
    })
  }
  else {
    const runtimeConfig = useRuntimeConfig().public['nuxt-schema-org']
    if (runtimeConfig?.reactive) {
      return useHead<{ script: { nodes: Input } }>({
        script: [script],
      })
    }
  }
}
