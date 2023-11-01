import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import { ref } from 'vue'
import type { NuxtDevtoolsClient } from '@nuxt/devtools-kit/dist/types'
import { refreshSources, schemaOrgGraph } from './state'

export const devtools = ref<NuxtDevtoolsClient>()

onDevtoolsClientConnected(async (client) => {
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
