<script setup lang="ts">
import { ref } from 'vue'
import { loadShiki } from './composables/shiki'
import { schemaOrgGraph } from './composables/state'

await loadShiki()
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
          Graph
        </h2>
        <p text-sm op60 mb3>
          The schema.org graph for the current page. Will update when changing pages.
        </p>
      </div>
    </div>
    <div>
      <OCodeBlock :code="schemaOrgGraph" lang="json" />
    </div>
    <div class="flex-auto" />
  </div>
</template>
