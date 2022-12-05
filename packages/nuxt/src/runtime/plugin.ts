import { SchemaOrgUnheadPlugin } from '@unhead/schema-org-vue'
// @ts-expect-error untyped
import config from '#nuxt-schema-org/config'
import { defineNuxtPlugin, useRouter } from '#app'
import {joinURL} from "ufo";

export default defineNuxtPlugin((nuxtApp) => {
  const head = nuxtApp.vueApp._context.provides.usehead

  const router = useRouter()
  const currentRoute = router.currentRoute
  head.hooks.addHooks(SchemaOrgUnheadPlugin(config, () => {
    const route = currentRoute.value
    return {
      url: joinURL(config.canonicalHost, route.path),
      ...route.meta,
    }
  }).hooks)
})