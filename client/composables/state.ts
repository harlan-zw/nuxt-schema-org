import { ref } from 'vue'
import type { ModuleRuntimeConfig } from 'nuxt-site-config'
import { appFetch } from './rpc'

export const schemaOrgGraph = ref<any>(null)

export const data = ref<{
  nitroOrigin: string
  runtimeConfig: ModuleRuntimeConfig
} | null>(null)

export async function refreshSources() {
  if (appFetch.value)
    data.value = await appFetch.value('/__schema-org__/debug.json')
}
