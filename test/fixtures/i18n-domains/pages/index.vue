<script lang="ts" setup>
import { useHead, useI18n, useLocaleHead } from '#imports'

const i18n = useI18n()
useHead({
  title: i18n.t('welcome'),
})

useLocaleHead()
</script>

<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>
