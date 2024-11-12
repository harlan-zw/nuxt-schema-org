import { resolve } from 'pathe'
import NuxtSchemaOrg from '../../../src/module'

function r(s: string) {
  return resolve(__dirname, s)
}

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    NuxtSchemaOrg,
    '@nuxtjs/i18n',
  ],
  schemaOrg: {
    identity: 'Organization',
  },
  site: {
    url: 'https://nuxtseo.com',
  },
  i18n: {
    langDir: r('./locales'),
    strategy: 'no_prefix',
    differentDomains: true,
    detectBrowserLanguage: false,
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        domain: 'en.nuxtseo.com',
        file: r('./locales/en'),
      },
      {
        code: 'ja',
        language: 'ja',
        domain: 'http://jp.nuxtseo.com:3000/',
        file: r('./locales/ja'),
      },
      {
        code: 'zh',
        language: 'zh',
        domain: 'zh.nuxtseo.com',
        file: r('./locales/zh'),
      },
    ],
  },

  compatibilityDate: '2024-07-22',
})
