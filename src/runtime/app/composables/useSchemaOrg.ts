import type { useSchemaOrg as _useSchemaOrg } from '@unhead/schema-org/vue'
import type { ActiveHeadEntry, Script, UseHeadInput } from '@unhead/vue'
import { useNuxtApp } from 'nuxt/app'
import { isRef, toValue } from 'vue'
import { useHead } from '#imports'
import { useSchemaOrgConfig } from '../utils/config'

type Input = Parameters<typeof _useSchemaOrg>[0]
export function useSchemaOrg<T extends Input>(input: T): ActiveHeadEntry<UseHeadInput> | undefined {
  const config = useSchemaOrgConfig()
  const nuxtApp = useNuxtApp()
  // When input is a ref (e.g. a computed), it needs special handling so the
  // Nuxt context is available wherever it is evaluated, and so unhead can read
  // it (unhead resolves function values on the `nodes` prop but does not unwrap
  // refs there).
  // On the server the value is resolved eagerly here in setup, where the Nuxt
  // context is active: SSR renders once so no reactivity is needed, and unhead
  // runs head resolution outside the Nuxt context (where useNuxtApp() throws).
  // On the client it stays a getter wrapped in runWithContext, which restores
  // the context synchronously when unhead re-evaluates it outside of setup.
  // This fixes "useNuxtApp() called outside of setup" errors. See #105.
  let nodes: unknown = input
  if (isRef(input)) {
    nodes = import.meta.server
      ? toValue(input)
      : () => nuxtApp.runWithContext(() => toValue(input))
  }
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
