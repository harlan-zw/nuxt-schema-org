<script lang="ts" setup>
import {
  defineOrganization,
  defineWebPage,
  defineWebSite,
  ref,
  useHead,
  useI18n,
  useSchemaOrg,
  useSchemaOrgCustom,
  useSiteConfig,
} from '#imports'
import { defineArticle } from '@unhead/schema-org/vue'

const name = ref('Harlan\'s Hamburgers')

useSchemaOrgCustom()

const i18n = useI18n()

function setLanguage(code: string) {
  i18n.setLocale(code)
}

const locale = useSiteConfig().currentLocale

const languageOptions = [
  [
    { label: 'English', onSelect() { setLanguage('en') } },
    { label: 'French', onSelect() { setLanguage('fr') } },
  ],
]

useSchemaOrg([
  defineArticle({
    datePublished: new Date(Date.UTC(2021, 10, 1, 0, 0, 0)),
    dateModified: new Date(Date.UTC(2022, 1, 1, 0, 0, 0)),
  }),
  defineWebPage({
    name: 'Harlan Wilton',
  }),
  defineOrganization({
    name,
    logo: 'https://emojiguide.org/images/emoji/n/3ep4zx1jztp0n.png',
    address: {
      streetAddress: '123 Main St',
      addressLocality: 'Harlan',
      addressRegion: 'MA',
      postalCode: '01234',
      addressCountry: 'US',
    },
    image: 'https://emojiguide.org/images/emoji/n/3ep4zx1jztp0n.png',
  }),
  defineWebSite({
    name: 'Harlan\'s Hamburgers',
  }),
])

name.value = 'Harlan\'s Hamburgers - Updated'

useHead({
  title: 'Harlan\'s Hamburgers',
  link: [
    { rel: 'icon', type: 'image/png', href: 'https://emojiguide.org/images/emoji/n/3ep4zx1jztp0n.png' },
  ],
})
const nav = [
  { name: 'Home', item: '/' },
  { name: 'About', item: '/about' },
  { name: 'Articles', item: '/blog' },
  { name: 'Shop', item: '/shop' },
  { name: 'FAQ', item: '/faq' },
]
</script>

<template>
  <UApp>
    <div class="flex flex-col min-h-screen">
      <header class="sticky top-0 z-50 w-full backdrop-blur flex-none border-b">
        <div class="max-w-screen-xl mx-auto px-4 py-3">
          <div class="flex items-center justify-between">
            <NuxtLink to="/" class="flex items-end gap-1.5 font-bold text-xl text-[var(--ui-text)]">
              🍔
              Harlan's <span class="text-green-500">Hamburgers</span>
            </NuxtLink>
            <div class="space-x-2">
              <UButton v-for="(link, key) in nav" :key="key" :to="link.item" variant="ghost" color="neutral">
                {{ link.name }}
              </UButton>
            </div>
            <UDropdownMenu :items="languageOptions">
              <UButton color="neutral" variant="outline" :label="locale" trailing-icon="i-lucide-chevron-down" />
            </UDropdownMenu>
          </div>
        </div>
      </header>
      <main class="min-h-full h-full flex-grow">
        <div class="max-w-screen-xl mx-auto px-4 mt-4">
          <NuxtLayout>
            <NuxtPage />
          </NuxtLayout>
        </div>
      </main>
      <footer class="text-sm text-[var(--ui-text-muted)] flex justify-center items-center gap-1.5 py-5">
        Made by <UAvatar src="https://avatars.githubusercontent.com/u/5326365?v=4" size="xs" /> Harlan Wilton
      </footer>
    </div>
  </UApp>
</template>
