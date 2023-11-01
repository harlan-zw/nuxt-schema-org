import { SchemaOrgUnheadPlugin } from '@unhead/schema-org'
import { joinURL } from 'ufo'
import { computed } from 'vue'
import type { ModuleOptions } from '../module'
import { defineNuxtPlugin, injectHead, useHead, useRouter, useRuntimeConfig, useSiteConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:init',
  enforce: 'post',
  setup(nuxtApp) {
    const head = injectHead()
    const config = useRuntimeConfig().public['nuxt-schema-org'] as ModuleOptions
    const router = useRouter()

    const siteConfig = useSiteConfig()
    const schemaOrg = computed(() => {
      return {
        ...router.currentRoute.value.meta,
        ...siteConfig as Record<string, string>,
        url: joinURL(siteConfig.url, router.currentRoute.value.path),
        host: siteConfig.url!,
        inLanguage: siteConfig.currentLocale || siteConfig.defaultLocale,
        path: router.currentRoute.value.path,
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
