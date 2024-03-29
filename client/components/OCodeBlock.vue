<script setup lang="ts">
import type { Lang } from 'shiki-es'
import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { highlight } from '../composables/shiki'

const props = withDefaults(
  defineProps<{
    code: string
    lang?: Lang
    lines?: boolean
    transformRendered?: (code: string) => string
  }>(),
  {
    lines: true,
  },
)
const clipboard = useClipboard()
const icon = ref('carbon:copy')
function copy() {
  clipboard.copy(props.code)
  icon.value = 'carbon:checkmark'

  setTimeout(() => {
    icon.value = 'carbon:copy'
  }, 2000)
}

const rendered = computed(() => {
  const code = highlight(props.code, props.lang)
  return props.transformRendered ? props.transformRendered(code || '') : code
})
</script>

<template>
  <div class="group relative">
    <NButton
      :icon="icon"
      variant="solid"
      class="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-[1]"
      size="xs"
      tabindex="-1"
      @click="copy"
    />
    <pre
      class="n-code-block"
      :class="lines ? 'n-code-block-lines' : ''"
      v-html="rendered"
    />
  </div>
</template>

<style>
.n-code-block-lines .shiki code {
  counter-reset: step;
  counter-increment: step calc(var(--start, 1) - 1);
}
.n-code-block-lines .shiki code .line::before {
  content: counter(step);
  counter-increment: step;
  width: 2rem;
  padding-right: 0.5rem;
  margin-right: 0.5rem;
  display: inline-block;
  text-align: right;
  --at-apply: text-truegray:50;
}
</style>
