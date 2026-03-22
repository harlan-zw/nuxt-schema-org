<script setup lang="ts">
import { computed, useHead } from '#imports'
import { colorMode, refresh } from './composables/rpc'
import { loadShiki } from './composables/shiki'
import { schemaOrgGraph } from './util/logic'

useHead({
  title: 'Nuxt Schema.org Playground',
})

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

const isDark = computed(() => colorMode.value === 'dark')
useHead({
  htmlAttrs: {
    class: () => isDark.value ? 'dark' : '',
  },
})

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
  <UApp>
    <div class="relative bg-base flex flex-col min-h-screen">
      <div class="gradient-bg" />

      <!-- Header -->
      <header class="header glass sticky top-0 z-50">
        <div class="header-content">
          <!-- Logo & Brand -->
          <div class="flex items-center gap-3 sm:gap-4">
            <a
              href="https://nuxtseo.com"
              target="_blank"
              class="flex items-center opacity-90 hover:opacity-100 transition-opacity"
            >
              <NuxtSeoLogo class="h-6 sm:h-7" />
            </a>

            <div class="divider" />

            <div class="flex items-center gap-2">
              <div class="brand-icon">
                <UIcon name="carbon:image-search" class="text-base sm:text-lg" />
              </div>
              <h1 class="text-sm sm:text-base font-semibold tracking-tight text-[var(--color-text)]">
                Schema.org
              </h1>
              <UBadge
                color="neutral"
                variant="subtle"
                size="xs"
                class="font-mono text-[10px] sm:text-xs hidden sm:inline-flex"
              >
                {{ runtimeVersion }}
              </UBadge>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex items-center gap-1 sm:gap-2">
            <!-- Nav Tabs -->
            <div class="nav-tabs">
              <button
                v-for="item of navItems"
                :key="item.value"
                type="button"
                class="nav-tab"
                :class="[tab === item.value ? 'active' : '']"
                @click="tab = item.value"
              >
                <UTooltip :text="item.label" :delay-duration="300">
                  <div class="nav-tab-inner">
                    <UIcon
                      :name="item.icon"
                      class="text-base sm:text-lg"
                      :class="tab === item.value ? 'text-[var(--seo-green)]' : ''"
                    />
                    <span class="nav-label">{{ item.label }}</span>
                  </div>
                </UTooltip>
              </button>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1">
              <UTooltip text="Refresh" :delay-duration="300">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="carbon:reset"
                  class="nav-action"
                  @click="refresh"
                />
              </UTooltip>

              <UTooltip text="GitHub" :delay-duration="300">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="carbon:logo-github"
                  to="https://github.com/harlan-zw/nuxt-schema-org"
                  target="_blank"
                  class="nav-action hidden sm:flex"
                />
              </UTooltip>
            </div>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <div class="main-content">
        <main class="mx-auto flex flex-col w-full max-w-7xl">
          <div v-if="!schemaOrgGraph || schemaOrgGraph === 'loading'" class="flex items-center justify-center py-20">
            <UIcon name="carbon:circle-dash" class="text-2xl animate-spin text-[var(--color-text-muted)]" />
          </div>

          <div v-else-if="tab === 'validate'">
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
            <iframe src="https://nuxtseo.com/schema-org" class="w-full border-none rounded-lg" style="min-height: calc(100vh - 100px);" />
          </div>
        </main>
      </div>
    </div>
  </UApp>
</template>

<style>
/* Header */
.header {
  border-bottom: 1px solid var(--color-border);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 1rem;
  max-width: 80rem;
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 640px) {
  .header-content {
    padding: 0.75rem 1.25rem;
  }
}

.divider {
  width: 1px;
  height: 1.25rem;
  background: var(--color-border);
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-sm);
  background: oklch(65% 0.2 145 / 0.12);
  color: var(--seo-green);
}

/* Navigation tabs */
.nav-tabs {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  padding: 0.25rem;
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border-subtle);
}

.nav-tab {
  position: relative;
  border-radius: var(--radius-sm);
  transition: background 150ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 150ms cubic-bezier(0.22, 1, 0.36, 1);
}

.nav-tab-inner {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  font-weight: 500;
}

@media (min-width: 640px) {
  .nav-tab-inner {
    padding: 0.375rem 0.75rem;
  }
}

.nav-tab:hover .nav-tab-inner {
  color: var(--color-text);
}

.nav-tab.active {
  background: var(--color-surface-elevated);
  box-shadow: 0 1px 3px oklch(0% 0 0 / 0.08);
}

.dark .nav-tab.active {
  box-shadow: 0 1px 3px oklch(0% 0 0 / 0.3);
}

.nav-tab.active .nav-tab-inner {
  color: var(--color-text);
}

.nav-label {
  display: none;
}

@media (min-width: 640px) {
  .nav-label {
    display: inline;
  }
}

.nav-action {
  color: var(--color-text-muted) !important;
}

.nav-action:hover {
  color: var(--color-text) !important;
  background: var(--color-surface-sunken) !important;
}

/* Main content wrapper */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  min-height: calc(100vh - 60px);
}

@media (min-width: 640px) {
  .main-content {
    padding: 1rem;
  }
}

@media (max-height: 600px) {
  .main-content {
    padding: 0;
    min-height: 0;
  }
}

/* Base HTML */
html {
  font-family: var(--font-sans);
  overflow-y: scroll;
  overscroll-behavior: none;
}

body {
  min-height: 100vh;
}

html.dark {
  color-scheme: dark;
}
</style>
