<script setup lang="ts">
import { schemaOrgGraph } from '../composables/rpc'
import { asArray, nodeToSchemaOrgLink } from '../util/schema-validation'

const nodes = computed(() => {
  if (schemaOrgGraph.value) {
    try {
      return JSON.parse(schemaOrgGraph.value)['@graph']
    }
    catch {}
  }
  return false
})

const schemaOrgExample = `useSchemaOrg([
  defineWebPage({ title: 'Hello World' })
])`
</script>

<template>
  <div class="space-y-3 stagger-children">
    <DevtoolsEmptyState
      v-if="!nodes?.length"
      title="Oops! Did you forget useSchemaOrg()?"
      description="Getting started with Nuxt Schema.org is easy, simply add the following code within your setup script."
      icon="carbon:information"
    >
      <DevtoolsSnippet :code="schemaOrgExample" lang="js" />
      <p class="text-sm text-[var(--color-text-muted)] mt-4">
        <a href="https://nuxtseo.com/docs/schema-org/getting-started/introduction" target="_blank" class="text-[var(--seo-green)] hover:underline">
          Learn more
        </a>
      </p>
    </DevtoolsEmptyState>
    <DevtoolsSection v-for="(node, key) in nodes" v-else :key="key">
      <template #text>
        <h3 v-for="t in asArray(node['@type']).map(nodeToSchemaOrgLink)" :key="t.type" class="text-sm space-x-2">
          <span class="font-semibold">{{ t.type }}</span>
          <a
            :href="t.schemaOrg"
            target="_blank"
            class="text-[var(--seo-green)] hover:underline text-xs"
          >
            Schema.org
            <UIcon name="carbon:launch" class="text-[10px] ml-0.5 opacity-50" />
          </a>
          <a
            v-if="t.googlePage"
            :href="t.googlePage"
            target="_blank"
            class="text-[var(--seo-green)] hover:underline text-xs"
          >
            Rich Results
            <UIcon name="carbon:launch" class="text-[10px] ml-0.5 opacity-50" />
          </a>
        </h3>
      </template>
      <template #description>
        <div>{{ node['@id'] }}</div>
      </template>
      <DevtoolsSnippet :code="JSON.stringify(node, null, 2)" lang="json" :label="asArray(node['@type']).map(t => t.replace('https://schema.org/', '')).join(', ')" />
    </DevtoolsSection>
  </div>
</template>
