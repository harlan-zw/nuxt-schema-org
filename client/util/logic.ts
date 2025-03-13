import { withBase } from 'ufo'
import { computed, ref } from 'vue'

export const schemaOrgGraph = ref<any>(null)
export const refreshTime = ref(Date.now())
export const globalRefreshTime = ref(Date.now())
export const hostname = window.location.host
export const path = ref('/')
export const query = ref()
export const base = ref('/')

export const host = computed(() => withBase(base.value, `${window.location.protocol}//${hostname}`))
