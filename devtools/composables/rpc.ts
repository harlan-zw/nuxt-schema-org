import type { VueHeadClient } from '@unhead/vue/types'

export const hostHead = ref<VueHeadClient>()
export const schemaOrgGraph = ref<any>(null)

async function fetchGraph() {
  schemaOrgGraph.value = 'loading'
  schemaOrgGraph.value = (await hostHead.value!.resolveTags())
    .filter(t => !!t.props['data-nuxt-schema-org'])[0]
    ?.innerHTML || {}
}

useDevtoolsConnection({
  onConnected(client) {
    hostHead.value = client.host.nuxt.vueApp._context.provides.usehead
    fetchGraph()
    refreshSources()
  },
  onRouteChange() {
    setTimeout(fetchGraph, 100)
    refreshSources()
  },
})
