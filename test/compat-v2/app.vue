<script setup lang="ts">
import { computed } from 'vue'

// exercises the cross-major node-input path: a computed ref of nodes, which
// unhead v2 and v3 resolve differently (see useSchemaOrg)
useSchemaOrg(computed(() => [
  defineArticle({
    headline: 'Hello v2',
    description: 'computed-ref article on the unhead v2 stack',
  }),
]))
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
