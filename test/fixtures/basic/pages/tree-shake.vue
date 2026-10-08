<script lang="ts" setup>
import { defineWebPage as defineUnheadWebPage, useSchemaOrg as useUnheadSchemaOrg } from '@unhead/schema-org/vue'
import { defineWebPage as defineAliasWebPage, useSchemaOrg as useAliasSchemaOrg } from '#schema-org/app'
import { defineWebPage, useSchemaOrg } from '#imports'
import { useSchemaOrg as useDeepSchemaOrg } from '#schema-org/app/composables/useSchemaOrg'

useSchemaOrg([defineWebPage({
  name: 'tree-shaken-page',
})])
useAliasSchemaOrg([defineAliasWebPage({
  description: 'tree-shaken-alias',
})])
useUnheadSchemaOrg([defineUnheadWebPage({
  headline: 'tree-shaken-unhead',
})])

useDeepSchemaOrg([{
  '@id': 'https://nuxtseo.com/#deep-alias',
  '@type': 'WebPage',
  'name': 'tree-shaken-deep-alias',
}])
</script>

<template>
  <div>tree-shake</div>
</template>
