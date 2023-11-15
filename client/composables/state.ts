import { ref } from 'vue'
import type { ModuleRuntimeConfig } from 'nuxt-site-config'
import { appFetch, unheadInstance } from './rpc'

export const schemaOrgGraph = ref<any>(null)

export const data = ref<{
  nitroOrigin: string
  runtimeConfig: ModuleRuntimeConfig
} | null>(null)

export async function refreshSources() {
  schemaOrgGraph.value = (await unheadInstance.value!.resolveTags())
    .filter(t => t.key === 'schema-org-graph')[0]?.innerHTML
  if (appFetch.value)
    data.value = await appFetch.value('/__schema-org__/debug.json')
}
