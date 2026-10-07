<script lang="ts" setup>
import { defineWebPage as defineUnheadWebPage, useSchemaOrg as useUnheadSchemaOrg } from '@unhead/schema-org/vue'
import { defineWebPage as defineAliasWebPage, useSchemaOrg as useAliasSchemaOrg } from '#schema-org/app'
import { defineWebPage, useSchemaOrg } from '#imports'

useSchemaOrg([defineWebPage({
  name: 'tree-shaken-page',
})])
useAliasSchemaOrg([defineAliasWebPage({
  description: 'tree-shaken-alias',
})])
useUnheadSchemaOrg([defineUnheadWebPage({
  headline: 'tree-shaken-unhead',
})])
</script>

<template>
  <div>tree-shake</div>
</template>
