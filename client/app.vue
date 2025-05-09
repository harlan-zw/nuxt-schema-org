<script setup lang="ts">
import { useHead } from '#imports'
import { refresh } from './composables/rpc'
import { schemaOrgGraph } from './util/logic'
import 'floating-vue/dist/style.css'

useHead({
  title: 'Nuxt Schema.org Playground',
})

await loadShiki()

const { data } = fetchGlobalDebug()

const tab = ref('nodes')
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

const googleStructedDataLinks = {
  // Google Search Gallery to Schema.org mapping
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
  // convert to array
  // turn into links pointing to schema.org documentation for node
  const simpleType = type.replace('https://schema.org/', '')
  // Find Google page that uses this schema type
  const googlePage = Object.entries(googleStructedDataLinks)
    .find(([_, types]) => types.includes(simpleType))?.[0]
  return {
    type: simpleType,
    schemaOrg: `https://schema.org/${simpleType}`,
    googlePage: googlePage ? `https://developers.google.com/search/docs/appearance/structured-data/${googlePage}` : null,
  }
}
</script>

<template>
  <div class="relative n-bg-base flex flex-col">
    <header class="sticky top-0 z-2 px-4 pt-4">
      <div class="flex justify-between items-start" mb2>
        <div class="flex space-x-5">
          <h1 text-xl flex items-center gap-2>
            <NIcon icon="carbon:image-search" class="text-blue-300" />
            Schema.org <NBadge class="text-sm">
              {{ data?.runtimeConfig.version }}
            </NBadge>
          </h1>
        </div>
        <div class="flex items-center space-x-3 text-xl">
          <fieldset
            class="n-select-tabs flex flex-inline flex-wrap items-center border n-border-base rounded-lg n-bg-base"
          >
            <label
              v-for="(value, idx) of ['nodes', 'raw', 'debug', 'docs']"
              :key="idx"
              class="relative n-border-base hover:n-bg-active cursor-pointer"
              :class="[
                idx ? 'border-l n-border-base ml--1px' : '',
                value === tab ? 'n-bg-active' : '',
              ]"
            >
              <div v-if="value === 'nodes'" :class="[value === tab ? '' : 'op35']">
                <VTooltip>
                  <div class="px-5 py-2">
                    <h2 text-lg flex items-center>
                      <NIcon icon="carbon:connect-source opacity-50" />
                    </h2>
                  </div>
                  <template #popper>
                    Nodes
                  </template>
                </VTooltip>
              </div>
              <div v-if="value === 'raw'" :class="[value === tab ? '' : 'op35']">
                <VTooltip>
                  <div class="px-5 py-2">
                    <h2 text-lg flex items-center>
                      <NIcon icon="carbon:code opacity-50" />
                    </h2>
                  </div>
                  <template #popper>
                    Raw
                  </template>
                </VTooltip>
              </div>
              <div v-else-if="value === 'debug'" :class="[value === tab ? '' : 'op35']">
                <VTooltip>
                  <div class="px-5 py-2">
                    <h2 text-lg flex items-center>
                      <NIcon icon="carbon:debug opacity-50" />
                    </h2>
                  </div>
                  <template #popper>
                    Debug
                  </template>
                </VTooltip>
              </div>
              <div v-else-if="value === 'docs'" :class="[value === tab ? '' : 'op35']">
                <VTooltip>
                  <div class="px-5 py-2">
                    <h2 text-lg flex items-center>
                      <NIcon icon="carbon:book opacity-50" />
                    </h2>
                  </div>
                  <template #popper>
                    Documentation
                  </template>
                </VTooltip>
              </div>
              <input
                v-model="tab"
                type="radio"
                :value="value"
                :title="value"
                class="absolute cursor-pointer pointer-events-none inset-0 op-0.1"
              >
            </label>
          </fieldset>
          <VTooltip>
            <button text-lg="" type="button" class="n-icon-button n-button n-transition n-disabled:n-disabled" @click="refresh">
              <NIcon icon="carbon:reset" class="group-hover:text-green-500" />
            </button>
            <template #popper>
              Refresh
            </template>
          </VTooltip>
        </div>
        <div class="items-center space-x-3 hidden lg:flex">
          <div class="opacity-80 text-sm">
            <NLink href="https://github.com/sponsors/harlan-zw" target="_blank">
              <NIcon icon="carbon:favorite" class="mr-[2px]" />
              Sponsor
            </NLink>
          </div>
          <div class="opacity-80 text-sm">
            <NLink href="https://github.com/harlan-zw/nuxt-schema-org" target="_blank">
              <NIcon icon="logos:github-icon" class="mr-[2px]" />
              Submit an issue
            </NLink>
          </div>
          <a href="https://nuxtseo.com" target="_blank" class="flex items-end gap-1.5 font-semibold text-xl dark:text-white font-title">
            <NuxtSeoLogo />
          </a>
        </div>
      </div>
    </header>
    <div class="flex-row flex p4 h-full" style="min-height: calc(100vh - 64px);">
      <main class="mx-auto flex flex-col w-full bg-white dark:bg-black dark:bg-dark-700 bg-light-200 ">
        <NLoading v-if="!schemaOrgGraph || schemaOrgGraph === 'loading'" />
        <div v-else-if="tab === 'nodes'">
          <div v-if="!nodes?.length">
            <div class="flex flex-col items-center justify-center mx-auto max-w-135 h-85vh">
              <div class="">
                <h2 class="text-2xl font-semibold mb-3">
                  <NIcon icon="carbon:information" class="text-blue-500" />
                  Oops! Did you forget <code>useSchemaOrg()</code>?
                </h2>
                <p class="text-lg opacity-80 my-3">
                  Getting started with Nuxt Schema.org is easy, simply add the following code within setup script setup of your file.
                </p>
                <div class="px-3 py-2 space-y-5 rounded mb-3 border">
                  <OCodeBlock :code="schemaOrgExample" lang="javascript" />
                </div>
                <p class="text-lg opacity-80">
                  <a href="https://nuxtseo.com/docs/schema-org/getting-started/introduction" target="_blank" class="underline">
                    Learn more
                  </a>
                </p>
              </div>
            </div>
          </div>
          <OSectionBlock v-for="(node, key) in nodes" v-else :key="key">
            <template #text>
              <h3 v-for="t in asArray(node['@type']).map(nodeToSchemaOrgLink)" :key="t.type" class="opacity-80 text-base space-x-2">
                <span>{{ t.type }}</span>
                <NuxtLink
                  :to="t.schemaOrg"
                  target="_blank"
                  class="dark:text-blue-300 hover:underline"
                >
                  Schema.org
                  <NIcon icon="carbon:launch" class="text-xs ml-[2px] opacity-50" />
                </NuxtLink>
                <NuxtLink
                  v-if="t.googlePage"
                  :to="t.googlePage"
                  target="_blank"
                  class="dark:text-blue-300 hover:underline"
                >
                  Rich Results
                  <NIcon icon="carbon:launch" class="text-xs ml-[2px] opacity-50" />
                </NuxtLink>
              </h3>
            </template>
            <template #description>
              <div>{{ node['@id'] }}</div>
            </template>
            <div class="px-3 py-2 space-y-5">
              <OCodeBlock :code="JSON.stringify(node, null, 2)" lang="json" />
            </div>
          </OSectionBlock>
        </div>
        <div v-else-if="tab === 'raw'" class="space-y-5">
          <div class="space-x-3">
            <NLink to="https://validator.schema.org/" target="_blank">
              <NIcon icon="carbon:launch" class="text-xs mr-1 opacity-50" />Structured Data Test
            </NLink>
            <NLink to="https://search.google.com/test/rich-results" target="_blank">
              <NIcon icon="carbon:launch" class="text-xs mr-1 opacity-50" />Rich Results Test
            </NLink>
            <NButton @click="copyGraph">
              Copy
            </NButton>
          </div>
          <OCodeBlock :code="schemaOrgGraph" lang="json" />
        </div>
        <div v-else-if="tab === 'debug'" class="space-y-5">
          <OSectionBlock>
            <template #text>
              <h3 class="opacity-80 text-base mb-1">
                <NIcon icon="carbon:settings" class="mr-1" />
                Runtime Config
              </h3>
            </template>
            <OCodeBlock :code="JSON.stringify(data?.runtimeConfig || {}, null, 2)" lang="json" />
          </OSectionBlock>
        </div>
        <div v-else-if="tab === 'docs'" class="h-full max-h-full overflow-hidden">
          <iframe src="https://nuxtseo.com/schema-org" class="w-full h-full border-none" style="min-height: calc(100vh - 100px);" />
        </div>
      </main>
    </div>
  </div>
</template>

<style>
.tab-panels {
  width: 100%;
}
div[role="tabpanel"] {
  width: 100%;
  display: flex;
}
.splitpanes.default-theme .splitpanes__pane {
  background-color: transparent !important;
}
.dark .splitpanes.default-theme .splitpanes__splitter {
  background-color: transparent !important;
  border-left: 1px solid rgba(156, 163, 175, 0.05);
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.05) 50%, rgba(0, 0, 0, 0));
}
.dark .splitpanes.default-theme .splitpanes__splitter:before, .splitpanes.default-theme .splitpanes__splitter:after {
  background-color: rgba(156, 163, 175, 0.3) !important;
}

header {
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  background-color: #fffc;
}

.dark header {
  background-color: #111c;
}

html {
  --at-apply: font-sans;
  overflow-y: scroll;
  overscroll-behavior: none;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
body::-webkit-scrollbar {
  display: none;
}
body {
  /* trap scroll inside iframe */
  height: calc(100vh + 1px);
}

html.dark {
  background: #111;
  color-scheme: dark;
}

/* Markdown */
.n-markdown a {
  --at-apply: text-primary hover:underline;
}
.prose a {
  --uno: hover:text-primary;
}
.prose code::before {
  content: ""
}
.prose code::after {
  content: ""
}
.prose hr {
  --uno: border-solid border-1 border-b border-base h-1px w-full block my-2 op50;
}

/* JSON Editor */
textarea {
  background: #8881
}

:root {
  --jse-theme-color: #fff !important;
  --jse-text-color-inverse: #777 !important;
  --jse-theme-color-highlight: #eee !important;
  --jse-panel-background: #fff !important;
  --jse-background-color: var(--jse-panel-background) !important;
  --jse-error-color: #ee534150 !important;
  --jse-main-border: none !important;
}

.dark, .jse-theme-dark {
  --jse-panel-background: #111 !important;
  --jse-theme-color: #111 !important;
  --jse-text-color-inverse: #fff !important;
  --jse-main-border: none !important;
}

.no-main-menu {
  border: none !important;
}

.jse-main {
  min-height: 1em !important;
}

.jse-contents {
  border-width: 0 !important;
  border-radius: 5px !important;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar:horizontal {
  height: 6px;
}

::-webkit-scrollbar-corner {
  background: transparent;
}

::-webkit-scrollbar-track {
  background: var(--c-border);
  border-radius: 1px;
}

::-webkit-scrollbar-thumb {
  background: #8881;
  transition: background 0.2s ease;
  border-radius: 1px;
}

::-webkit-scrollbar-thumb:hover {
  background: #8885;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
}
</style>
