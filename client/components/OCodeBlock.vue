<script setup lang="ts">
import { computedAsync } from '@vueuse/core'
import { type BundledLanguage, codeToHtml } from 'shiki'

const props = withDefaults(
  defineProps<{
    code: string
    lang?: BundledLanguage
    lines?: boolean
    transformRendered?: (code: string) => string
  }>(),
  {
    lines: false,
  },
)
const rendered = computedAsync(async () => {
  const colorMode = devtools.value?.colorMode || 'light'
  return await codeToHtml(props.code, {
    lang: props.lang,
    theme: colorMode === 'dark' ? 'vitesse-dark' : 'vitesse-light',
  }) || ''
})
</script>

<template>
  <pre
    class="n-code-block"
    :class="lines ? 'n-code-block-lines' : ''"
    v-html="rendered"
  />
</template>

<style>
.n-code-block-lines .shiki code .line::before {
  display: none;
}
</style>
