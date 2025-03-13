import { useAsyncData } from '#imports'
import { globalRefreshTime } from '../util/logic'

export function fetchGlobalDebug() {
  return useAsyncData<{
    nitroOrigin: string
    runtimeConfig: any
  }>(() => {
    // @ts-expect-error untyped
    return appFetch.value('/__schema-org__/debug.json')
  }, {
    watch: [globalRefreshTime],
  })
}
