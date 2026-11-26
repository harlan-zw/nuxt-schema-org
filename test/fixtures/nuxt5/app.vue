<script setup lang="ts">
import { createError, useRequestURL } from 'nuxt/app'
import { defineWebPage, useSchemaOrg } from '#schema-org/app'

if (useRequestURL().pathname === '/missing')
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })

useSchemaOrg([defineWebPage({ name: 'Typed alias page' })])
</script>
<template><main>Typed alias page</main></template>
