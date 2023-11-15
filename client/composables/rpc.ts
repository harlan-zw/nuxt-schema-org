import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import { ref } from 'vue'
import type { NuxtDevtoolsClient } from '@nuxt/devtools-kit/dist/types'
import type { $Fetch } from 'nitropack'
import { refreshSources, schemaOrgGraph } from './state'

export const devtools = ref<NuxtDevtoolsClient>()

export const appFetch = ref<$Fetch>()

onDevtoolsClientConnected(async (client) => {
  appFetch.value = client.host.app.$fetch
  const head = client.host.nuxt.vueApp._context.provides.usehead
  schemaOrgGraph.value = (await head.resolveTags())
    .filter(t => t.key === 'schema-org-graph')[0]?.innerHTML
  client.host.nuxt.$router.afterEach(() => {
    setTimeout(async () => {
      schemaOrgGraph.value = (await head.resolveTags())
        .filter(t => t.key === 'schema-org-graph')[0]?.innerHTML
    }, 100)
  })
  devtools.value = client.devtools
  refreshSources()
})
