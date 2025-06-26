import type { NuxtDevtoolsClient } from '@nuxt/devtools-kit/types'
import type { VueHeadClient } from '@unhead/vue/types'
import type { $Fetch } from 'nitropack'
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import { useDebounceFn } from '@vueuse/core'
import { ref } from 'vue'
import { schemaOrgGraph } from '../util/logic'

export const hostHead = ref<VueHeadClient>()

export const devtools = ref<NuxtDevtoolsClient>()

export const appFetch = ref<$Fetch>()

const debounceRefresh = useDebounceFn(async () => {
  schemaOrgGraph.value = (await hostHead.value!.resolveTags())
    .filter(t => !!t.props['data-nuxt-schema-org'])[0]
    ?.innerHTML || {}
}, 300)

export async function refresh() {
  schemaOrgGraph.value = 'loading'
  debounceRefresh()
}

onDevtoolsClientConnected(async (client) => {
  // @ts-expect-error untyped
  appFetch.value = client.host.app.$fetch
  devtools.value = client.devtools
  hostHead.value = client.host.nuxt.vueApp._context.provides.usehead
  client.host.nuxt.$router.afterEach(() => {
    setTimeout(refresh, 100)
  })
  refresh()
})
