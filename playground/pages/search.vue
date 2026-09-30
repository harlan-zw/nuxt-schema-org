<script setup lang="ts">
import { defineWebPage, useSchemaOrg } from '#imports'
import { useHead } from 'nuxt/app'

useHead({
  titleTemplate: '%s - Harlan\'s Hamburgers',
  title: 'Search Hamburgers 🍔',
})
useSchemaOrg([
  defineWebPage({
    '@type': ['CollectionPage', 'SearchResultsPage'],
  }),
])
</script>

<template>
  <div>Search</div>
</template>
