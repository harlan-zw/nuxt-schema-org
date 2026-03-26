<script setup lang="ts">
import { fetchGlobalDebug, isProductionMode, loadShiki, navigateTo, refreshSources, useRoute } from '#imports'
import { computed, watch } from 'vue'
import { schemaOrgGraph } from './composables/rpc'

await loadShiki()

const { data } = fetchGlobalDebug()

const route = useRoute()
const currentTab = computed(() => {
  const path = route.path
  if (path.startsWith('/raw'))
    return 'raw'
  if (path.startsWith('/debug'))
    return 'debug'
  if (path.startsWith('/docs'))
    return 'docs'
  return 'validate'
})

const navItems = [
  { value: 'validate', to: '/', icon: 'carbon:connect-source', label: 'Nodes', devOnly: false },
  { value: 'raw', to: '/raw', icon: 'carbon:code', label: 'Raw', devOnly: true },
  { value: 'debug', to: '/debug', icon: 'carbon:debug', label: 'Debug', devOnly: true },
  { value: 'docs', to: '/docs', icon: 'carbon:book', label: 'Docs', devOnly: false },
]

const runtimeVersion = computed(() => {
  return data.value?.runtimeConfig?.version || 'unknown'
})

watch(isProductionMode, (isProd) => {
  if (isProd && ['raw', 'debug'].includes(currentTab.value))
    return navigateTo('/')
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
