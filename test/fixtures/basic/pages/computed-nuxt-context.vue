<script lang="ts" setup>
import { computed, defineArticle, useNuxtApp, useSchemaOrg } from '#imports'

const nuxtApp = useNuxtApp()

useSchemaOrg(computed(() => {
  // Access useNuxtApp() inside the computed getter to exercise the
  // context-preservation fix from #105. Without the fix this throws
  // "useNuxtApp() called outside of setup".
  const _app = useNuxtApp()
  void _app
  return [
    defineArticle({
      headline: `Computed context test - ${nuxtApp.$config?.app?.baseURL || '/'}`,
      description: 'Testing computed ref with Nuxt composable context',
      image: 'https://example.com/image.png',
    }),
  ]
}))
</script>

<template>
  <div>computed-nuxt-context</div>
</template>
