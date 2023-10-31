import { UnheadSchemaOrg } from '@unhead/schema-org'
import { joinURL } from 'ufo'
import type { ModuleOptions } from '../module'
import { defineNuxtPlugin, injectHead, useHead, useRouter, useRuntimeConfig, useSiteConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:init',
  setup() {
    const head = injectHead()
    const config = useRuntimeConfig().public['nuxt-schema-org'] as ModuleOptions
    const router = useRouter()

    const siteConfig = useSiteConfig()
    useHead({
      templateParams: {
        schemaOrg: {
          ...router.currentRoute.value.meta,
          ...siteConfig as Record<string, string>,
          url: () => joinURL(siteConfig.url, router.currentRoute.value.path),
          host: siteConfig.url!,
          inLanguage: siteConfig.currentLocale || siteConfig.defaultLocale,
          path: () => router.currentRoute.value.path,
        },
      },
    })
    head.use(
      UnheadSchemaOrg({
        minify: config.minify,
        trailingSlash: siteConfig.trailingSlash,
      }),
    )
  },
})
