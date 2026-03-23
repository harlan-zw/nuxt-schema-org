import type { VueHeadClient } from '@unhead/vue/types'
import { useDebounceFn } from '@vueuse/core'
import { ref } from 'vue'
import { useDevtoolsConnection } from 'nuxtseo-layer-devtools/composables/rpc'
import { schemaOrgGraph } from '../util/logic'

export const hostHead = ref<VueHeadClient>()

const debounceRefresh = useDebounceFn(async () => {
  schemaOrgGraph.value = (await hostHead.value!.resolveTags())
    .filter(t => !!t.props['data-nuxt-schema-org'])[0]
    ?.innerHTML || {}
}, 300)

export async function refresh() {
  schemaOrgGraph.value = 'loading'
  debounceRefresh()
}

useDevtoolsConnection({
  onConnected: (client) => {
    hostHead.value = client.host.nuxt.vueApp._context.provides.usehead
    refresh()
  },
  onRouteChange: () => {
    setTimeout(refresh, 100)
  },
})
