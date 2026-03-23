<script setup lang="ts">
import { computed } from 'vue'
import {
  analyzeNodeProperties,
  extractSchemaNodes,
  formatPropertyValue,
  getNestedProperty,
  getNodeDescription,
  getNodeType,
  getSchemaIcon,
  googleRichResultsRequirements,
  isRichResultType,
  validateGraph,
} from '../util/schema-validation'

const { graph } = defineProps<{
  graph: string
}>()

const parsed = computed(() => {
  try {
    return JSON.parse(graph)
  }
  catch {
    return null
  }
})

const validation = computed(() => {
  if (!parsed.value)
    return null
  return validateGraph(parsed.value)
})

const overallStatus = computed(() => {
  if (!validation.value)
    return null

  const { summary } = validation.value

  if (summary.totalNodes === 0) {
    return {
      type: 'warning' as const,
      icon: 'carbon:warning',
      message: 'No structured data nodes detected on this page.',
    }
  }

  if (summary.totalErrors > 0) {
    return {
      type: 'error' as const,
      icon: 'carbon:close-filled',
      message: `Found ${summary.totalErrors} missing required property${summary.totalErrors > 1 ? 'ies' : 'y'} across ${summary.totalNodes} node${summary.totalNodes > 1 ? 's' : ''}`,
    }
  }

  if (summary.totalWarnings > 0) {
    return {
      type: 'warning' as const,
      icon: 'carbon:warning',
      message: `${summary.totalWarnings} missing recommended property${summary.totalWarnings > 1 ? 'ies' : 'y'}, but all required fields present`,
    }
  }

  return {
    type: 'success' as const,
    icon: 'carbon:checkmark-filled',
    message: `All ${summary.totalNodes} node${summary.totalNodes > 1 ? 's' : ''} validated successfully.`,
  }
})

// Track which nodes have their details expanded
const expandedRaw = ref<Set<number>>(new Set())
function toggleRaw(index: number) {
  if (expandedRaw.value.has(index)) {
    expandedRaw.value.delete(index)
  }
  else {
    expandedRaw.value.add(index)
  }
}

// Filter out foundation-only nodes for display
const displayNodes = computed(() => {
  if (!validation.value)
    return []
  return validation.value.nodes.filter((node) => {
    const type = getNodeType(node)
    return type !== 'Unknown'
  })
})

function nodeCardClass(node: any) {
  const type = getNodeType(node)
  const requirements = googleRichResultsRequirements[type]
  const analysis = analyzeNodeProperties(node)

  if (requirements?.recommended?.length && analysis.missingRecommended.length === 0 && analysis.missingRequired.length === 0)
    return 'node-card-success'
  if (isRichResultType(type) && (analysis.missingRecommended.length > 0 || analysis.missingRequired.length > 0))
    return 'node-card-active'
  return ''
}

const foundationOnlyTypes = new Set(['WebSite', 'WebPage', 'ImageObject'])
const hasOnlyFoundationSchemas = computed(() => {
  return displayNodes.value.length > 0 && displayNodes.value.every(n => foundationOnlyTypes.has(getNodeType(n)))
})
</script>

<template>
  <div class="space-y-4 stagger-children">
    <!-- Overall Status -->
    <div
      v-if="overallStatus"
      class="status-banner"
      :class="{
        'status-success': overallStatus.type === 'success',
        'status-warning': overallStatus.type === 'warning',
        'status-error': overallStatus.type === 'error',
      }"
    >
      <UIcon :name="overallStatus.icon" class="text-lg flex-shrink-0" />
      <span class="text-sm font-medium">{{ overallStatus.message }}</span>
      <div v-if="validation" class="ml-auto flex items-center gap-2">
        <UBadge color="neutral" variant="subtle" size="xs">
          {{ validation.summary.totalNodes }} nodes
        </UBadge>
        <UBadge v-if="validation.summary.richResultNodes > 0" color="primary" variant="subtle" size="xs">
          {{ validation.summary.richResultNodes }} rich result eligible
        </UBadge>
      </div>
    </div>

    <!-- Foundation-only message -->
    <div v-if="hasOnlyFoundationSchemas" class="text-center py-6">
      <UIcon name="carbon:information" class="text-2xl text-[var(--color-text-muted)] mb-2" />
      <p class="text-sm text-[var(--color-text-muted)]">
        Only foundation schemas detected (WebSite, WebPage, ImageObject)
      </p>
      <p class="text-xs text-[var(--color-text-subtle)] mt-1">
        Consider adding rich result schemas for better search visibility
      </p>
    </div>

    <!-- Node Cards -->
    <div v-for="(node, index) in displayNodes" :key="index" class="node-card" :class="nodeCardClass(node)">
      <!-- Header -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2">
          <UIcon
            :name="getSchemaIcon(getNodeType(node))"
            :class="isRichResultType(getNodeType(node)) ? 'text-[var(--seo-green)]' : 'text-[var(--color-text-muted)]'"
          />
          <span class="font-semibold text-sm">{{ getNodeType(node) }}</span>
          <UBadge
            v-if="isRichResultType(getNodeType(node))"
            color="primary"
            variant="subtle"
            size="xs"
          >
            Rich Result
          </UBadge>
        </div>
        <a
          v-if="googleRichResultsRequirements[getNodeType(node)]"
          :href="googleRichResultsRequirements[getNodeType(node)].documentationUrl"
          target="_blank"
          class="text-xs text-[var(--color-text-muted)] hover:text-[var(--seo-green)] transition-colors flex items-center gap-1"
        >
          <UIcon name="carbon:launch" class="text-[10px]" /> Docs
        </a>
      </div>

      <!-- Description -->
      <p v-if="getNodeDescription(node)" class="text-xs text-[var(--color-text-muted)] mb-3 truncate">
        {{ getNodeDescription(node) }}
      </p>

      <!-- Validation Status -->
      <div v-if="analyzeNodeProperties(node).missingRequired.length > 0" class="validation-alert validation-error mb-3">
        <UIcon name="carbon:warning" class="mt-0.5 flex-shrink-0" />
        <div class="text-xs">
          <span class="font-medium">Missing required:</span>
          <span class="ml-1 opacity-80">{{ analyzeNodeProperties(node).missingRequired.join(', ') }}</span>
        </div>
      </div>

      <div
        v-else-if="googleRichResultsRequirements[getNodeType(node)]?.recommended?.length > 0 && analyzeNodeProperties(node).missingRecommended.length === 0"
        class="validation-alert validation-success mb-3"
      >
        <UIcon name="carbon:checkmark-filled" class="mt-0.5 flex-shrink-0" />
        <div class="text-xs">
          <span class="font-medium">Excellent!</span>
          <span class="ml-1 opacity-80">All recommended properties present</span>
        </div>
      </div>

      <div
        v-else-if="analyzeNodeProperties(node).missingRecommended.length > 0 && analyzeNodeProperties(node).missingRecommended.length <= 5"
        class="validation-alert validation-warning mb-3"
      >
        <UIcon name="carbon:information" class="mt-0.5 flex-shrink-0" />
        <div class="text-xs">
          <span class="font-medium">Missing recommended:</span>
          <span class="ml-1 opacity-80">{{ analyzeNodeProperties(node).missingRecommended.slice(0, 5).join(', ') }}</span>
        </div>
      </div>

      <!-- Property Checklists -->
      <div class="space-y-3">
        <!-- Required Properties -->
        <div v-if="googleRichResultsRequirements[getNodeType(node)]?.required?.length > 0">
          <h5 class="text-xs font-medium mb-2">Required Properties</h5>
          <div class="space-y-1.5">
            <div
              v-for="prop in googleRichResultsRequirements[getNodeType(node)].required"
              :key="prop"
              class="flex items-center gap-2 text-xs"
            >
              <UIcon
                :name="getNestedProperty(node, prop) ? 'carbon:checkmark-filled' : 'carbon:close-filled'"
                :class="getNestedProperty(node, prop) ? 'text-green-500' : 'text-red-500'"
              />
              <span class="font-mono text-[var(--seo-green)]">{{ prop }}:</span>
              <span v-if="getNestedProperty(node, prop)" class="text-[var(--color-text-subtle)] truncate">
                {{ formatPropertyValue(getNestedProperty(node, prop)) }}
              </span>
              <span v-else class="text-red-500">missing</span>
            </div>
          </div>
        </div>

        <!-- Recommended Properties -->
        <details v-if="googleRichResultsRequirements[getNodeType(node)]?.recommended?.length > 0" class="group">
          <summary class="cursor-pointer text-xs font-medium hover:text-[var(--seo-green)] transition-colors">
            Recommended Properties ({{ Object.keys(analyzeNodeProperties(node).presentProperties).filter(p => googleRichResultsRequirements[getNodeType(node)]?.recommended.includes(p)).length }}/{{ googleRichResultsRequirements[getNodeType(node)]?.recommended.length }})
          </summary>
          <div class="space-y-1.5 mt-2">
            <div
              v-for="prop in googleRichResultsRequirements[getNodeType(node)].recommended"
              :key="prop"
              class="flex items-center gap-2 text-xs"
            >
              <UIcon
                :name="getNestedProperty(node, prop) ? 'carbon:checkmark' : 'carbon:subtract'"
                :class="getNestedProperty(node, prop) ? 'text-green-500' : 'text-[var(--color-text-subtle)]'"
              />
              <span class="font-mono text-[var(--seo-green)] opacity-70">{{ prop }}:</span>
              <span v-if="getNestedProperty(node, prop)" class="text-[var(--color-text-subtle)] truncate">
                {{ formatPropertyValue(getNestedProperty(node, prop)) }}
              </span>
              <span v-else class="text-[var(--color-text-subtle)] opacity-50">not set</span>
            </div>
          </div>
        </details>

        <!-- View all properties -->
        <details class="group">
          <summary class="cursor-pointer text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            View all properties ({{ Object.keys(node).length }})
          </summary>
          <div class="mt-2">
            <DevtoolsSnippet :code="JSON.stringify(node, null, 2)" lang="json" />
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-banner {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid;
}

.status-success {
  background: oklch(65% 0.2 145 / 0.08);
  border-color: oklch(65% 0.2 145 / 0.2);
  color: oklch(55% 0.2 145);
}
.dark .status-success {
  color: oklch(75% 0.15 145);
}

.status-warning {
  background: oklch(75% 0.15 85 / 0.08);
  border-color: oklch(75% 0.15 85 / 0.2);
  color: oklch(60% 0.15 85);
}
.dark .status-warning {
  color: oklch(80% 0.12 85);
}

.status-error {
  background: oklch(60% 0.2 25 / 0.08);
  border-color: oklch(60% 0.2 25 / 0.2);
  color: oklch(55% 0.2 25);
}
.dark .status-error {
  color: oklch(75% 0.15 25);
}

.node-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem;
  transition: border-color 200ms ease;
}

.node-card:hover {
  border-color: var(--color-neutral-300);
}
.dark .node-card:hover {
  border-color: var(--color-neutral-700);
}

.node-card-success {
  border-color: oklch(65% 0.2 145 / 0.3);
}
.node-card-success:hover {
  border-color: oklch(65% 0.2 145 / 0.5);
}

.node-card-active {
  border-color: oklch(65% 0.15 250 / 0.2);
}

.validation-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid;
}

.validation-error {
  background: oklch(60% 0.2 25 / 0.06);
  border-color: oklch(60% 0.2 25 / 0.2);
  color: oklch(55% 0.2 25);
}
.dark .validation-error {
  color: oklch(75% 0.15 25);
}

.validation-success {
  background: oklch(65% 0.2 145 / 0.06);
  border-color: oklch(65% 0.2 145 / 0.2);
  color: oklch(55% 0.2 145);
}
.dark .validation-success {
  color: oklch(75% 0.15 145);
}

.validation-warning {
  background: oklch(75% 0.15 85 / 0.06);
  border-color: oklch(75% 0.15 85 / 0.2);
  color: oklch(60% 0.15 85);
}
.dark .validation-warning {
  color: oklch(80% 0.12 85);
}

details summary::-webkit-details-marker {
  display: none;
}
details summary {
  list-style: none;
}
details[open] > summary {
  color: var(--color-text);
}
</style>
