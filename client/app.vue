<script setup lang="ts">
import { computed } from '#imports'
import { refresh } from './composables/rpc'
import './composables/rpc'
import { schemaOrgGraph } from './util/logic'

await loadShiki()

const { data } = fetchGlobalDebug()

const tab = ref('validate')
const nodes = computed(() => {
  if (schemaOrgGraph.value) {
    try {
      return JSON.parse(schemaOrgGraph.value)['@graph']
    }
    catch {}
  }
  return false
})

function copyGraph() {
  navigator.clipboard.writeText(schemaOrgGraph.value)
}

const schemaOrgExample = `useSchemaOrg([
  defineWebPage({ title: 'Hello World' })
])`

const googleStructedDataLinks: Record<string, string[]> = {
  'article': ['Article', 'NewsArticle', 'BlogPosting'],
  'book': ['Book'],
  'breadcrumb': ['BreadcrumbList'],
  'carousel': ['ItemList'],
  'course-info': ['Course'],
  'course': ['Course'],
  'dataset': ['Dataset'],
  'discussion-forum': ['DiscussionForumPosting'],
  'education-qa': ['Question', 'Answer'],
  'employer-rating': ['EmployerAggregateRating'],
  'estimated-salary': ['OccupationalExperienceRequirements'],
  'event': ['Event'],
  'factcheck': ['ClaimReview'],
  'faqpage': ['FAQPage'],
  'image-license-metadata': ['ImageObject'],
  'job-posting': ['JobPosting'],
  'learning-video': ['LearningResource', 'VideoObject'],
  'local-business': ['LocalBusiness'],
  'math-solvers': ['MathSolver'],
  'movie': ['Movie'],
  'organization': ['Organization'],
  'practice-problems': ['Quiz', 'Question'],
  'product': ['Product'],
  'product-snippet': ['Product'],
  'merchant-listing': ['Product', 'Offer'],
  'product-variants': ['Product'],
  'profile-page': ['ProfilePage', 'Person'],
  'qapage': ['QAPage'],
  'recipe': ['Recipe'],
  'review-snippet': ['Review'],
  'software-app': ['SoftwareApplication'],
  'speakable': ['SpeakableSpecification'],
  'special-announcements': ['SpecialAnnouncement'],
  'paywalled-content': ['CreativeWork'],
  'vacation-rental': ['Accommodation', 'LodgingBusiness'],
  'vehicle-listing': ['Vehicle'],
  'video': ['VideoObject'],
}

function asArray(value: any) {
  return Array.isArray(value) ? value : [value]
}

function nodeToSchemaOrgLink(type: string) {
  const simpleType = type.replace('https://schema.org/', '')
  const googlePage = Object.entries(googleStructedDataLinks)
    .find(([_, types]) => types.includes(simpleType))?.[0]
  return {
    type: simpleType,
    schemaOrg: `https://schema.org/${simpleType}`,
    googlePage: googlePage ? `https://developers.google.com/search/docs/appearance/structured-data/${googlePage}` : null,
  }
}

const navItems = [
  { value: 'validate', icon: 'carbon:checkmark-outline', label: 'Validate' },
  { value: 'nodes', icon: 'carbon:connect-source', label: 'Nodes' },
  { value: 'raw', icon: 'carbon:code', label: 'Raw' },
  { value: 'debug', icon: 'carbon:debug', label: 'Debug' },
  { value: 'docs', icon: 'carbon:book', label: 'Docs' },
]

const runtimeVersion = computed(() => {
  return data.value?.runtimeConfig?.version || 'unknown'
})
</script>

<template>
  <DevtoolsLayout
    v-model:active-tab="tab"
    title="Schema.org"
    icon="carbon:image-search"
    :version="runtimeVersion"
    :nav-items="navItems"
    github-url="https://github.com/harlan-zw/nuxt-schema-org"
    :loading="!schemaOrgGraph || schemaOrgGraph === 'loading'"
    @refresh="refresh"
  >
    <div v-if="tab === 'validate'">
      <SchemaValidator :graph="schemaOrgGraph" />
    </div>

    <div v-else-if="tab === 'nodes'" class="space-y-3 stagger-children">
      <div v-if="!nodes?.length">
        <div class="flex flex-col items-center justify-center mx-auto max-w-xl py-20">
          <div class="card p-8 text-center">
            <UIcon name="carbon:information" class="text-3xl text-blue-500 mb-4" />
            <h2 class="text-xl font-semibold mb-3">
              Oops! Did you forget <code class="text-sm bg-[var(--color-surface-sunken)] px-2 py-0.5 rounded">useSchemaOrg()</code>?
            </h2>
            <p class="text-sm text-[var(--color-text-muted)] mb-4">
              Getting started with Nuxt Schema.org is easy, simply add the following code within your setup script.
            </p>
            <OCodeBlock :code="schemaOrgExample" lang="javascript" />
            <p class="text-sm text-[var(--color-text-muted)] mt-4">
              <a href="https://nuxtseo.com/docs/schema-org/getting-started/introduction" target="_blank" class="text-[var(--seo-green)] hover:underline">
                Learn more
              </a>
            </p>
          </div>
        </div>
      </div>
      <OSectionBlock v-for="(node, key) in nodes" v-else :key="key">
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
        <OCodeBlock :code="JSON.stringify(node, null, 2)" lang="json" />
      </OSectionBlock>
    </div>

    <div v-else-if="tab === 'raw'" class="space-y-4">
      <div class="flex items-center gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          icon="carbon:launch"
          to="https://validator.schema.org/"
          target="_blank"
        >
          Structured Data Test
        </UButton>
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          icon="carbon:launch"
          to="https://search.google.com/test/rich-results"
          target="_blank"
        >
          Rich Results Test
        </UButton>
        <UButton
          variant="soft"
          color="neutral"
          size="sm"
          icon="carbon:copy"
          @click="copyGraph"
        >
          Copy
        </UButton>
      </div>
      <OCodeBlock :code="schemaOrgGraph" lang="json" />
    </div>

    <div v-else-if="tab === 'debug'" class="space-y-4">
      <OSectionBlock icon="carbon:settings">
        <template #text>
          Runtime Config
        </template>
        <OCodeBlock :code="JSON.stringify(data?.runtimeConfig || {}, null, 2)" lang="json" />
      </OSectionBlock>
    </div>

    <div v-else-if="tab === 'docs'" class="h-full max-h-full overflow-hidden">
      <DevtoolsDocs url="https://nuxtseo.com/schema-org" />
    </div>
  </DevtoolsLayout>
</template>
