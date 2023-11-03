import { SchemaOrgUnheadPlugin } from '@unhead/schema-org'
import { joinURL } from 'ufo'
import { computed } from 'vue'
import type { ModuleOptions } from '../module'
import { defineNuxtPlugin, injectHead, useHead, useRoute, useRuntimeConfig, useSiteConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:init',
  enforce: 'post',
  setup(nuxtApp) {
    const head = injectHead()
    const config = useRuntimeConfig().public['nuxt-schema-org'] as ModuleOptions
    const route = useRoute()

    const siteConfig = useSiteConfig()
    const schemaOrg = computed(() => {
      return {
        ...route.meta,
        ...siteConfig as Record<string, string>,
        url: joinURL(siteConfig.url, route.path),
        host: siteConfig.url!,
        inLanguage: siteConfig.currentLocale || siteConfig.defaultLocale,
        path: route.path,
      }
    })
    useHead({
      templateParams: {
        schemaOrg,
      },
    })
    head.use(
      SchemaOrgUnheadPlugin({}, async () => {
        const meta = {}
        // call hook
        await nuxtApp.hooks.callHook('schema-org:meta', meta)
        return meta
      }, {
        minify: config.minify,
        trailingSlash: siteConfig.trailingSlash,
      }),
    )
  },
})
