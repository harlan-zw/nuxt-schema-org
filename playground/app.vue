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

// const route = useRoute()

// const breadcrumbItems = computed(() => {
//   const nav: any[] = [{ name: 'Home', item: '/' }, { name: 'Articles', item: '/blog' }]
//   if (route.path.startsWith('/blog/') && route.meta.title)
//     nav.push({ name: route.meta.title })
//   return nav
// })

const name = ref('Harlan\'s Hamburgers')

useSchemaOrgCustom()

const i18n = useI18n()

function setLanguage(code: string) {
  i18n.setLocale(code)
}

const locale = useSiteConfig().currentLocale

const languageOptions = [
  [
    { label: 'English', click() { setLanguage('en') } },
    { label: 'French', click() { setLanguage('fr') } },
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
  <div class="flex flex-col min-h-screen">
    <header class="sticky top-0 z-50 w-full backdrop-blur flex-none border-b">
      <UContainer class="py-3">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="flex items-end gap-1.5 font-bold text-xl text-gray-900 dark:text-white">
            🍔
            Harlan's <span class="text-green-500">Hamburgers</span>
          </NuxtLink>
          <div class="space-x-2">
            <UButton v-for="(link, key) in nav" :key="key" :to="link.item" variant="ghost">
              {{ link.name }}
            </UButton>
          </div>
          <UDropdown :items="languageOptions" :popper="{ placement: 'bottom-start' }">
            <UButton color="white" :label="locale" trailing-icon="i-heroicons-chevron-down-20-solid" />
          </UDropdown>
        </div>
      </UContainer>
    </header>
    <main class="min-h-full h-full flex-grow">
      <UContainer class="mt-4">
        <NuxtPage />
      </UContainer>
    </main>
    <footer class="text-sm text-gray-700 flex justify-center items-center py-5">
      Made by <UAvatar src="https://avatars.githubusercontent.com/u/5326365?v=4" size="xs" class="max-w-5 w-5! h-5 mx-auto" /> Harlan Wilton
    </footer>
  </div>
</template>
