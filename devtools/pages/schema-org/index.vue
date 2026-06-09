<script setup lang="ts">
import SchemaValidator from '../../components/schema-org/SchemaValidator.vue'
import { schemaOrgGraph } from '../../lib/schema-org/rpc'
</script>

<template>
  <SchemaValidator :graph="schemaOrgGraph" />
</template>
