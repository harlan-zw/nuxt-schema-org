<script lang="ts" setup>
import { createError } from '#imports'

throw createError({
  statusCode: 500,
  statusMessage: 'Server Error',
})
</script>

<template>
  <div>error</div>
</template>
