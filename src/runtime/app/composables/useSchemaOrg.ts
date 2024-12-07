import type { ActiveHeadEntry, DataKeys, ScriptBase, TagUserProperties } from '@unhead/schema'
import type { useSchemaOrg as _useSchemaOrg } from '@unhead/schema-org/vue'
import type { UnheadAugmentation } from '../../types'
import { useHead, useServerHead } from '@unhead/vue'
import { useRequestEvent } from 'nuxt/app'
import { useSchemaOrgConfig } from '../utils/config'

type Input = Parameters<typeof _useSchemaOrg>[0]
export function useSchemaOrg<T extends Input>(input: T): ActiveHeadEntry<UnheadAugmentation<T>> | void {
  const config = useSchemaOrgConfig()
  const script: (ScriptBase & TagUserProperties & DataKeys) & UnheadAugmentation<T>['script'] = {
    type: 'application/ld+json',
    key: 'schema-org-graph',
    nodes: input,
    tagPriority: 'high',
    ...config.scriptAttributes,
  }
  // simple usage for dev
  if (import.meta.dev) {
    return useHead<UnheadAugmentation<T>>({
      script: [script],
    })
  }
  if (import.meta.server) {
    const event = useRequestEvent()
    // don't bother rendering schema.org if the page is not indexable
    if (typeof event?.context.robots !== 'undefined' && !event.context.robots?.indexable) {
      return
    }
    // we don't need to use the direct composable as the plugin is already registered
    return useServerHead<UnheadAugmentation<T>>({
      script: [script],
    })
  }
  else if (config?.reactive) {
    return useHead<UnheadAugmentation<T>>({
      script: [script],
    })
  }
}
