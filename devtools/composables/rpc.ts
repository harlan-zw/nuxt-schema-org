import type { VueHeadClient } from '@unhead/vue/types'
import { ref } from 'vue'
import { refreshSources, useDevtoolsConnection } from '#imports'

export const hostHead = ref<VueHeadClient>()
export const schemaOrgGraph = ref<any>(null)

async function fetchGraph() {
  // hostHead is only available when the embedded host exposes usehead; without
  // it there is no graph to resolve, so bail rather than calling a non-function.
  if (typeof hostHead.value?.resolveTags !== 'function') {
    schemaOrgGraph.value = {}
    return
  }
  schemaOrgGraph.value = 'loading'
  schemaOrgGraph.value = (await hostHead.value.resolveTags())
    .filter(t => !!t.props['data-nuxt-schema-org'])[0]
    ?.innerHTML || {}
}

useDevtoolsConnection({
  onConnected(client) {
    hostHead.value = client?.host?.nuxt?.vueApp?._context?.provides?.usehead
    fetchGraph()
    refreshSources()
  },
  onRouteChange() {
    setTimeout(fetchGraph, 100)
    refreshSources()
  },
})
