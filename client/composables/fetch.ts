import { useAsyncData } from '#imports'
import { refreshTime } from '../util/logic'

export function fetchGlobalDebug() {
  return useAsyncData<{
    nitroOrigin: string
    runtimeConfig: any
    siteConfig?: { url?: string }
  }>(() => {
    // @ts-expect-error untyped
    return appFetch.value('/__schema-org__/debug.json')
  }, {
    watch: [refreshTime],
  })
}
