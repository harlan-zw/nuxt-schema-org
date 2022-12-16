import { defineNuxtConfig } from 'nuxt/config'
import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  extends: [
    '@nuxt-themes/docus',
    'nuxt-seo-kit',
  ],

  modules: [
    'nuxt-windicss',
    resolve('./app/module'),
  ],

  runtimeConfig: {
    public: {
      indexable: true,
      siteUrl: 'https://unhead-schema-org.harlanzw.com/',
      siteTitle: 'Unhead Schema.org',
      siteDescription: 'Simple, universal Schema.org.',
      trailingSlash: false,
      language: 'en',
    }
  },

  app: {
    head: {
      title: 'Unhead Schema.org',
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
