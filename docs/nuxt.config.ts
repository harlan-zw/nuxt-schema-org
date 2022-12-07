import { defineNuxtConfig } from 'nuxt/config'
import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  extends: ['@nuxt-themes/docus'],

  modules: [
    'nuxt-windicss',
    resolve('./app/module'),
  ],

  app: {
    head: {
      title: '@unhead/schema-org',
      meta: [
        { property: 'og:title', content: '@unhead/schema-org' },
        { property: 'og:description', content: 'Simple and automated Schema.org for Google Rich Results with Vue.' },
        { property: 'og:url', content: 'https://unhead-schema-org.harlanzw.com//' },
        { property: 'og:image', content: 'https://unhead-schema-org.harlanzw.com//og.png' },
        { name: 'twitter:title', content: '@unhead/schema-org' },
        { name: 'twitter:description', content: 'Simple and automated Schema.org for Google Rich Results with Vue.' },
        { name: 'twitter:image', content: 'https://unhead-schema-org.harlanzw.com//og.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml', media: '(prefers-color-scheme:no-preference)' },
        { rel: 'icon', href: '/logo-dark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme:dark)' },
        { rel: 'icon', href: '/logo-light.svg', type: 'image/svg+xml', media: '(prefers-color-scheme:light)' },
      ],
      script: [
        {
          'src': 'https://cdn.usefathom.com/script.js',
          'data-spa': 'auto',
          'data-site': 'UQADBWCI',
          'defer': true,
        },
      ],
    },
  },

  content: {
    highlight: {
      theme: {
        dark: 'github-dark',
        default: 'github-light'
      },
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
      ],
    },
  },
})
