<script lang="ts" setup>
import { computed, useHead, useI18n, useLocaleHead, useSwitchLocalePath } from '#imports'

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() => {
  return locales.value.filter(i => i.code !== locale.value)
})

const i18n = useI18n()
useHead({
  title: i18n.t('welcome'),
})

useLocaleHead()
</script>

<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
    <NuxtLink v-for="l in availableLocales" :key="l.code" :to="switchLocalePath(l.code)" style="padding: 10px;">
      {{ l.code }}
    </NuxtLink>
  </div>
</template>
