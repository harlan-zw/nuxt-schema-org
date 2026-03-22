import type { useSchemaOrg as _useSchemaOrg } from '@unhead/schema-org/vue'
import type { Script } from '@unhead/vue'
import { useHead } from '#imports'
import { useNuxtApp } from 'nuxt/app'
import { computed, isRef } from 'vue'
import { useSchemaOrgConfig } from '../utils/config'

type Input = Parameters<typeof _useSchemaOrg>[0]
export function useSchemaOrg<T extends Input>(input: T) {
  const config = useSchemaOrgConfig()
  const nuxtApp = useNuxtApp()
  // When input is a ref (e.g. a computed), wrap it so the Nuxt async context
  // is preserved when unhead later evaluates the getter via toValue().
  // This fixes "useNuxtApp() called outside of setup" errors in computed
  // ref getters passed to useSchemaOrg(). See #105.
  const nodes = isRef(input)
    ? computed(() => nuxtApp.runWithContext(() => input.value))
    : input
  const script: Script = {
    type: 'application/ld+json',
    key: 'schema-org-graph',
    // @ts-expect-error untyped
    nodes,
    tagPriority: 'high',
    ...config.scriptAttributes,
  }
  // simple usage for dev
  if (import.meta.dev) {
    return useHead({
      script: [script],
    })
  }
  if (import.meta.server) {
    // we don't need to use the direct composable as the plugin is already registered
    return useHead({
      script: [script],
    })
  }
  else if (config?.reactive) {
    return useHead({
      script: [script],
    })
  }
}
