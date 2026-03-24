<script setup lang="ts">
import {
  analyzeNodeProperties,
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
      variant: 'warning' as const,
      icon: 'carbon:warning',
      message: 'No structured data nodes detected on this page.',
    }
  }

  if (summary.totalErrors > 0) {
    return {
      variant: 'error' as const,
      icon: 'carbon:close-filled',
      message: `Found ${summary.totalErrors} missing required property${summary.totalErrors > 1 ? 'ies' : 'y'} across ${summary.totalNodes} node${summary.totalNodes > 1 ? 's' : ''}`,
    }
  }

  if (summary.totalWarnings > 0) {
    return {
      variant: 'warning' as const,
      icon: 'carbon:warning',
      message: `${summary.totalWarnings} missing recommended property${summary.totalWarnings > 1 ? 'ies' : 'y'}, but all required fields present`,
    }
  }

  return {
    variant: 'success' as const,
    icon: 'carbon:checkmark-filled',
    message: `All ${summary.totalNodes} node${summary.totalNodes > 1 ? 's' : ''} validated successfully.`,
  }
})

const displayNodes = computed(() => {
  if (!validation.value)
    return []
  return validation.value.nodes.filter((node) => {
    return getNodeType(node) !== 'Unknown'
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
    <DevtoolsAlert
      v-if="overallStatus"
      :variant="overallStatus.variant"
      :icon="overallStatus.icon"
    >
      <span class="font-medium">{{ overallStatus.message }}</span>
      <template v-if="validation" #action>
        <div class="flex items-center gap-2">
          <UBadge>
            {{ validation.summary.totalNodes }} nodes
          </UBadge>
          <UBadge v-if="validation.summary.richResultNodes > 0" color="primary">
            {{ validation.summary.richResultNodes }} rich result eligible
          </UBadge>
        </div>
      </template>
    </DevtoolsAlert>

    <!-- Foundation-only message -->
    <DevtoolsEmptyState
      v-if="hasOnlyFoundationSchemas"
      title="Only foundation schemas detected"
      description="Only WebSite, WebPage, and ImageObject found. Consider adding rich result schemas for better search visibility."
      icon="carbon:information"
    />

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
          <UBadge v-if="isRichResultType(getNodeType(node))" color="primary">
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
      <DevtoolsAlert v-if="analyzeNodeProperties(node).missingRequired.length > 0" variant="error" class="mb-3">
        <span class="font-medium">Missing required:</span>
        <span class="ml-1 opacity-80">{{ analyzeNodeProperties(node).missingRequired.join(', ') }}</span>
      </DevtoolsAlert>

      <DevtoolsAlert
        v-else-if="googleRichResultsRequirements[getNodeType(node)]?.recommended?.length > 0 && analyzeNodeProperties(node).missingRecommended.length === 0"
        variant="success"
        class="mb-3"
      >
        <span class="font-medium">Excellent!</span>
        <span class="ml-1 opacity-80">All recommended properties present</span>
      </DevtoolsAlert>

      <DevtoolsAlert
        v-else-if="analyzeNodeProperties(node).missingRecommended.length > 0 && analyzeNodeProperties(node).missingRecommended.length <= 5"
        variant="warning"
        class="mb-3"
      >
        <span class="font-medium">Missing recommended:</span>
        <span class="ml-1 opacity-80">{{ analyzeNodeProperties(node).missingRecommended.slice(0, 5).join(', ') }}</span>
      </DevtoolsAlert>

      <!-- Property Checklists -->
      <div class="space-y-3">
        <!-- Required Properties -->
        <div v-if="googleRichResultsRequirements[getNodeType(node)]?.required?.length > 0">
          <h5 class="text-xs font-medium mb-2">
            Required Properties
          </h5>
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
        <DevtoolsSection
          v-if="googleRichResultsRequirements[getNodeType(node)]?.recommended?.length > 0"
          :text="`Recommended Properties (${Object.keys(analyzeNodeProperties(node).presentProperties).filter(p => googleRichResultsRequirements[getNodeType(node)]?.recommended.includes(p)).length}/${googleRichResultsRequirements[getNodeType(node)]?.recommended.length})`"
          :open="false"
        >
          <div class="space-y-1.5">
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
        </DevtoolsSection>

        <!-- View all properties -->
        <DevtoolsSection
          :text="`View all properties (${Object.keys(node).length})`"
          :open="false"
        >
          <DevtoolsSnippet :code="JSON.stringify(node, null, 2)" lang="json" />
        </DevtoolsSection>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>
