<script setup lang="ts">
import { schemaOrgGraph } from '../composables/rpc'
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <UButton
        icon="carbon:launch"
        to="https://validator.schema.org/"
        target="_blank"
      >
        Structured Data Test
      </UButton>
      <UButton
        icon="carbon:launch"
        to="https://search.google.com/test/rich-results"
        target="_blank"
      >
        Rich Results Test
      </UButton>
    </div>
    <DevtoolsSnippet :code="schemaOrgGraph" lang="json" label="schema.json" />
  </div>
</template>
