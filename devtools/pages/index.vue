<script setup lang="ts">
import { schemaOrgGraph } from '../composables/rpc'
</script>

<template>
  <SchemaValidator :graph="schemaOrgGraph" />
</template>
