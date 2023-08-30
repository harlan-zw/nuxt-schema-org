import { SchemaOrgUnheadPlugin } from '@unhead/schema-org'
import type { NuxtApp } from 'nuxt/app'
import { defineNuxtPlugin, injectHead, unref, useRouter, useRuntimeConfig, useSiteConfig } from '#imports'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const head = injectHead()

  if (!head)
    return

  const config = useRuntimeConfig().public['nuxt-schema-org']
  const router = useRouter()
  const currentRoute = router.currentRoute

  const siteConfig = useSiteConfig()
  head.use(SchemaOrgUnheadPlugin(config, async () => {
    const route = unref(currentRoute)
    const meta = {
      ...config,
      ...route.meta,
      path: route.path,
      host: siteConfig.url,
    }
    await nuxtApp.hooks.callHook('schema-org:meta', meta)
    return meta
  }))
})
