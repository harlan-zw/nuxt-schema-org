import { SchemaOrgUnheadPlugin } from '@unhead/schema-org'
import type { MetaInput as _MetaInput } from '@unhead/schema-org'
import { joinURL } from 'ufo'
import { computed } from 'vue'
import type { ModuleRuntimeConfig, MetaInput } from './types'
import { defineNuxtPlugin, injectHead, useRoute, useRuntimeConfig, useSiteConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:init',
  enforce: 'post',
  setup(nuxtApp) {
    const head = injectHead()
    const config = (useRuntimeConfig()['nuxt-schema-org'] || useRuntimeConfig().public['nuxt-schema-org']) as ModuleRuntimeConfig
    const route = useRoute()

    const siteConfig = useSiteConfig()
    const schemaOrg = computed(() => {
      return {
        ...(route.meta?.schemaOrg || {}),
        ...siteConfig as Record<string, string>,
        url: joinURL(siteConfig.url, route.path),
        host: siteConfig.url!,
        inLanguage: siteConfig.currentLocale || siteConfig.defaultLocale,
        path: route.path,
      }
    })
    head.push({ templateParams: { schemaOrg } })
    head.use(
      SchemaOrgUnheadPlugin({} as _MetaInput, async () => {
        const meta: MetaInput = {}
        // call hook
        await nuxtApp.hooks.callHook('schema-org:meta', meta)
        return meta as _MetaInput
      }, {
        minify: config.minify,
        trailingSlash: siteConfig.trailingSlash,
      }),
    )
  },
})
