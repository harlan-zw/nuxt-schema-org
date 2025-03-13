import type { NuxtDevtoolsClient } from '@nuxt/devtools-kit/types'
import type { $Fetch } from 'nitropack'
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import { ref } from 'vue'
import { schemaOrgGraph } from '../util/logic'

export const devtools = ref<NuxtDevtoolsClient>()

export const appFetch = ref<$Fetch>()

onDevtoolsClientConnected(async (client) => {
  // @ts-expect-error untyped
  appFetch.value = client.host.app.$fetch
  devtools.value = client.devtools
  const head = client.host.nuxt.vueApp._context.provides.usehead
  client.host.nuxt.$router.afterEach(() => {
    setTimeout(async () => {
      schemaOrgGraph.value = (await head.resolveTags())
        // @ts-expect-error untyped
        .filter(t => !!t.props['data-nuxt-schema-org'])[0]
        ?.innerHTML
    }, 100)
  })
  schemaOrgGraph.value = (await head.resolveTags())
    // @ts-expect-error untyped
    .filter(t => !!t.props['data-nuxt-schema-org'])[0]
    ?.innerHTML
})
