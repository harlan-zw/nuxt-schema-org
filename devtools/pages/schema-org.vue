<script setup lang="ts">
import { computed, watch } from 'vue'
import { isProductionMode, loadShiki, navigateTo, refreshSources, useRoute } from '#imports'
import { fetchGlobalDebug } from '../lib/schema-org/fetch'
import { schemaOrgGraph } from '../lib/schema-org/rpc'

await loadShiki()

const { data } = fetchGlobalDebug()

const route = useRoute()
const currentTab = computed(() => {
  const path = route.path
  if (path.startsWith('/schema-org/raw'))
    return 'raw'
  if (path.startsWith('/schema-org/debug'))
    return 'debug'
  if (path.startsWith('/schema-org/docs'))
    return 'docs'
  return 'validate'
})

const navItems = [
  { value: 'validate', to: '/schema-org', icon: 'carbon:connect-source', label: 'Nodes', devOnly: false },
  { value: 'raw', to: '/schema-org/raw', icon: 'carbon:code', label: 'Raw', devOnly: true },
  { value: 'debug', to: '/schema-org/debug', icon: 'carbon:debug', label: 'Debug', devOnly: true },
  { value: 'docs', to: '/schema-org/docs', icon: 'carbon:book', label: 'Docs', devOnly: false },
]

const runtimeVersion = computed(() => {
  return data.value?.runtimeConfig?.version || 'unknown'
})

watch(isProductionMode, (isProd) => {
  if (isProd && ['raw', 'debug'].includes(currentTab.value))
    return navigateTo('/schema-org')
})
</script>

<template>
  <DevtoolsLayout
    v-model:active-tab="currentTab"
    module-name="nuxt-schema-org"
    title="Schema.org"
    icon="carbon:image-search"
    :version="runtimeVersion"
    :nav-items="navItems"
    github-url="https://github.com/harlan-zw/nuxt-schema-org"
    :loading="!schemaOrgGraph || schemaOrgGraph === 'loading'"
    @refresh="refreshSources"
  >
    <NuxtPage />
  </DevtoolsLayout>
</template>
