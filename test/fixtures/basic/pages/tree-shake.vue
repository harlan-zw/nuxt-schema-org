<script lang="ts" setup>
import { defineWebPage, useSchemaOrg } from '#imports'

useSchemaOrg([defineWebPage({
  name: 'tree-shaken-page',
})])
</script>

<template>
  <div>tree-shake</div>
</template>
