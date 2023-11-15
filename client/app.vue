<script setup lang="ts">
import { loadShiki } from './composables/shiki'
import { schemaOrgGraph } from './composables/state'
import { ref, computed } from 'vue'

await loadShiki()

const tab = ref('nodes')
const nodes = computed(() => JSON.parse(schemaOrgGraph.value)['@graph'])
</script>

<template>
  <div class="relative p8 n-bg-base flex flex-col h-screen">
    <div>
      <div class="flex justify-between items-center" mb6>
        <div>
          <h1 text-xl mb2 flex items-center gap-2>
            <NIcon icon="carbon:chart-relationship text-blue-300" />
            Nuxt Schema.org <NBadge class="text-sm">
              {{ data?.runtimeConfig?.version }}
            </NBadge>
          </h1>
          <div class="space-x-3 mt-1 ml-1 opacity-80 text-sm">
            <NLink href="https://nuxtseo.com/sitemap" target="_blank">
              <NuxtSeoLogo class="mr-[2px] w-5 h-5 inline" />
              Documentation
            </NLink>
            <NLink href="https://github.com/harlan-zw/nuxt-simple-sitemap" target="_blank">
              Submit an issue
            </NLink>
          </div>
        </div>
        <div>
          <a href="https://nuxtseo.com" target="_blank" class="flex items-end gap-1.5 font-semibold text-xl dark:text-white font-title">
            <NuxtSeoLogo />
            <span class="hidden sm:block">Nuxt</span><span class="sm:text-green-500 dark:sm:text-green-400">SEO</span>
          </a>
        </div>
      </div>
    </div>
    <div>
      <fieldset
        class="n-select-tabs flex flex-inline flex-wrap items-center border n-border-base rounded-lg n-bg-base"
      >
        <label
          v-for="(value, idx) of ['nodes', 'raw']"
          :key="idx"
          class="relative n-border-base hover:n-bg-active px-0.5em py-0.1em"
          :class="[
            idx ? 'border-l n-border-base ml--1px' : '',
            value === tab ? 'n-bg-active' : '',
          ]"
        >
          <div v-if="value === 'nodes'" :class="[value === tab ? '' : 'op35']">
            <div class="px-2 py-1">
              <h2 text-lg flex items-center gap-2 mb-1>
                <NIcon icon="carbon:connect-source opacity-50" />
                Nodes <NBadge class="text-sm">
                  {{ nodes.length }}
                </NBadge>
              </h2>
              <p text-xs op60>
                The Schema.org nodes that are generated from your application.
              </p>
            </div>
          </div>
          <div v-if="value === 'raw'" :class="[value === tab ? '' : 'op35']">
            <div class="px-2 py-1">
              <h2 text-lg flex items-center gap-2 mb-1>
                <NIcon icon="carbon:connect-source opacity-50" />
                Raw Snippet
              </h2>
              <p text-xs op60>
                The raw JSON-LD snippet that is generated from your application.
              </p>
            </div>
          </div>
          <input
            v-model="tab"
            type="radio"
            :value="value"
            :title="value"
            class="absolute inset-0 op-0.1"
          >
        </label>
      </fieldset>
      <div class="mt-5">
        <div v-if="tab === 'nodes'">
          <OSectionBlock v-for="(node, key) in nodes" :key="key">
            <template #text>
              <h3 class="opacity-80 text-base mb-1">
                {{ Array.isArray(node['@type']) ? node['@type'].join(', ') : node['@type'] }}
              </h3>
            </template>
            <template #description>
              <div>{{ node['@id'] }}</div>
            </template>
            <div class="px-3 py-2 space-y-5">
              <OCodeBlock :code="JSON.stringify(node, null, 4)" lang="json" />
            </div>
          </OSectionBlock>
        </div>
        <div v-if="tab === 'raw'" class="space-y-5">
          <div class="space-x-3">
            <NLink to="https://validator.schema.org/" target="_blank">
              <NIcon icon="carbon:launch" class="text-xs mr-1 opacity-50" />Structured Data Test
            </NLink>
            <NLink to="https://search.google.com/test/rich-results" target="_blank">
              <NIcon icon="carbon:launch" class="text-xs mr-1 opacity-50" />Rich Results Test
            </NLink>
          </div>
          <OCodeBlock :code="schemaOrgGraph" lang="json" />
        </div>
      </div>
    </div>
    <div class="flex-auto" />
  </div>
</template>
