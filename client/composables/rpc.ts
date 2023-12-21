import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import { ref } from 'vue'
import type { NuxtDevtoolsClient } from '@nuxt/devtools-kit/dist/types'
import type { $Fetch } from 'nitropack'
import { schemaOrgGraph } from '../util/logic'

export const devtools = ref<NuxtDevtoolsClient>()

export const appFetch = ref<$Fetch>()

onDevtoolsClientConnected(async (client) => {
  appFetch.value = client.host.app.$fetch
  devtools.value = client.devtools
  const head = client.host.nuxt.vueApp._context.provides.usehead
  client.host.nuxt.$router.afterEach(() => {
    setTimeout(async () => {
      schemaOrgGraph.value = (await head.resolveTags())
        .filter(t => t.key === 'schema-org-graph')[0]?.innerHTML
    }, 100)
  })
  schemaOrgGraph.value = (await head.resolveTags())
    .filter(t => t.key === 'schema-org-graph')[0]?.innerHTML
  // unheadInstance.value = head
  // refreshSources()
})
