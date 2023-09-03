import type { MetaInput } from '@unhead/schema-org'
import { PluginSchemaOrg } from '@unhead/schema-org'
import type { NuxtApp } from 'nuxt/app'
import type { ModuleOptions } from '../module'
import { defineNuxtPlugin, injectHead, unref, useRouter, useRuntimeConfig, useSiteConfig } from '#imports'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const head = injectHead()
  const config = useRuntimeConfig().public['nuxt-schema-org'] as ModuleOptions
  const router = useRouter()
  const currentRoute = router.currentRoute

  const siteConfig = useSiteConfig()
  head.use(PluginSchemaOrg({
    minify: config.minify,
    resolveMeta: async () => {
      const route = unref(currentRoute)
      const meta: MetaInput = {
        host: siteConfig.url,
        trailingSlash: siteConfig.trailingSlash,
        inLanguage: siteConfig.defaultLocale,
        ...siteConfig as MetaInput,
        ...route.meta,
        path: route.path,
      }
      await nuxtApp.hooks.callHook('schema-org:meta', meta)
      return meta
    },
  }))
})
