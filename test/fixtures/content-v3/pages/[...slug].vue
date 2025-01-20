<script setup lang="ts">
import { queryCollection, useRoute } from '#imports'

const route = useRoute()
const { data: page } = await useAsyncData(`page-${route.path}`, () => {
  return queryCollection('content').path(route.path).first()
})
useSeoMeta({
  title: page.value?.seo?.title || 'Nuxt Schema.org',
  description: page.value?.seo?.description || 'The quickest and easiest way to build Schema.org graphs for Nuxt.',
})
useHead(page.value?.head || {})
</script>

<template>
  <div>
    <ContentRenderer
      v-if="page"
      :value="page"
    />
    <div v-else>
      Page not found
    </div>
  </div>
</template>
