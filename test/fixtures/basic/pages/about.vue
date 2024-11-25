<script lang="ts" setup>
import { defineWebPage, useSchemaOrg } from '#imports'

useSchemaOrg([defineWebPage({
  '@type': 'AboutPage',
  'name': 'About',
})])
</script>

<template>
  <div>about</div>
</template>
