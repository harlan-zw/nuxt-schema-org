<script setup lang="ts">
import { ref } from 'vue'
import { loadShiki } from './composables/shiki'
import { refreshSources, schemaOrgGraph } from './composables/state'

await loadShiki()

const loading = ref(false)

async function refresh() {
  loading.value = true
  await refreshSources()
  setTimeout(() => {
    loading.value = false
  }, 300)
}
</script>

<template>
  <div class="relative p8 n-bg-base flex flex-col h-screen">
    <div>
      <div class="flex justify-between" mb4>
        <div>
          <h1 text-xl mb2 flex items-center gap-2>
            <NIcon icon="carbon:chart-relationship text-blue-300" />
            Nuxt Schema.org
          </h1>
        </div>
      </div>
    </div>
    <div>
      <ul class="flex text-sm space-x-3 mb-6">
        <li>
          <NLink to="https://validator.schema.org/" target="_blank">
            <NIcon icon="carbon:launch" class="text-xs mr-1 opacity-50" />Structured Data Test
          </NLink>
        </li>
        <li>
          <NLink to="https://search.google.com/test/rich-results" target="_blank">
            <NIcon icon="carbon:launch" class="text-xs mr-1 opacity-50" />Rich Results Test
          </NLink>
        </li>
      </ul>
    </div>
    <div class="flex items-start space-x-5">
      <div>
        <h2 text-lg mb2 flex items-center gap-2>
          <NIcon icon="carbon:connect-source opacity-50" />
          Schema.org Graph
        </h2>
        <p text-sm op60 mb3>
          See the sources used to generate your sitemap.
        </p>
      </div>
      <NButton
        size="sm"
        @click="refresh"
      >
        <div v-if="!loading">
          Refresh
        </div>
        <NIcon v-else icon="carbon:progress-bar-round" class="animated animate-spin op50 text-xs" />
      </NButton>
    </div>
    <div>
      <OCodeBlock :code="schemaOrgGraph" lang="json" />
    </div>
    <div class="flex-auto" />
  </div>
</template>
