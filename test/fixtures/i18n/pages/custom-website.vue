<script setup lang="ts">
import { computed, defineWebPage, defineWebSite, useRoute, useSchemaOrg } from '#imports'

const route = useRoute()
useSchemaOrg(computed(() => [
  route.query.customIdentity
    ? defineWebSite({
        '@id': 'https://example.com/custom#website',
        'url': 'https://example.com/custom',
        'name': 'Custom website',
      })
    : defineWebSite({
        name: 'Custom website',
        description: 'Custom description',
        url: route.query.customUrl ? '/about-the-site' : undefined,
      }),
  defineWebSite({ '@id': 'https://example.com/#separate-website', 'name': 'Separate website' }),
  route.query.customParent
    ? defineWebPage({ isPartOf: { '@id': 'https://example.com/#separate-website' } })
    : undefined,
]))
</script>

<template>
  <h1>Custom website</h1>
</template>
