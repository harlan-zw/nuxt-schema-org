import { onDevtoolsClientConnected, useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import { useDevtoolsConnection } from 'nuxtseo-layer-devtools/composables/rpc'
import { refreshTime } from 'nuxtseo-layer-devtools/composables/state'
import { ref, watch } from 'vue'

// Mirror the layer's workaround: initialize the devtools client ref before any
// onDevtoolsClientConnected call, or the devtools-kit alpha getter on
// window.__NUXT_DEVTOOLS__ reads an uninitialized clientRef and throws
// "Cannot read properties of undefined (reading 'value')", crashing the panel.
useDevtoolsClient()

// The host's rendered `<script data-nuxt-schema-org>` JSON-LD is the source of
// truth for the graph. Reading it straight from the host document is resilient
// across unhead majors: v3 dropped the v2 `resolveTags()` we used to call on the
// injected head instance, which silently left this panel empty.
export const schemaOrgGraph = ref<string>('loading')

let hostDocument: Document | undefined

function fetchGraph(): void {
  if (!hostDocument)
    return
  const script = hostDocument.querySelector('script[data-nuxt-schema-org]')
  // Fall back to an empty-object string (not '') so the layout's loading guard
  // clears and the validator shows its "no nodes" state instead of spinning.
  schemaOrgGraph.value = script?.textContent || '{}'
}

// The layer's useDevtoolsConnection only surfaces app provides, not the host DOM,
// so open our own devtools-kit client handle to reach the host document via the
// mounted Vue app's container element.
onDevtoolsClientConnected((client) => {
  const nuxt: any = client.host?.nuxt
  hostDocument = nuxt?.vueApp?._container?.ownerDocument
    || nuxt?.vueApp?._instance?.vnode?.el?.ownerDocument
  fetchGraph()
})

useDevtoolsConnection({
  // Layer refreshes data on route change; re-read the graph once nav settles.
  onRouteChange() {
    setTimeout(fetchGraph, 100)
  },
})

// The Refresh button bumps the shared clock; re-read the rendered graph with it.
watch(refreshTime, () => fetchGraph())
