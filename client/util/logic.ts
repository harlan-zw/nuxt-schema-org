import { useLocalStorage } from '@vueuse/core'
import { hasProtocol } from 'ufo'
import { computed, ref } from 'vue'

export const schemaOrgGraph = ref<any>(null)
export const refreshTime = ref(Date.now())

// Production preview state
export const previewSource = useLocalStorage<'local' | 'production'>('nuxt-schema-org:preview-source', 'local')
export const productionUrl = ref<string>('')

export const hasProductionUrl = computed(() => {
  const url = productionUrl.value
  if (!url || !hasProtocol(url))
    return false
  return !url.includes('localhost') && !url.includes('127.0.0.1')
})

export const isProductionMode = computed(() => previewSource.value === 'production' && hasProductionUrl.value)
