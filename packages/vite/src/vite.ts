import { SchemaOrgUnheadPlugin } from '@unhead/schema-org-vue'
import type { UserConfig } from '@unhead/schema-org-vue'
import type { App } from 'vue'
import { createHead } from '@vueuse/head'
import type { Router } from 'vue-router'
import type { HeadClient } from '@vueuse/head'

export function installSchemaOrg(ctx: { app: App; router?: Router }, config: UserConfig) {
  let head = ctx.app._context.provides.usehead as HeadClient
  if (!head) {
    head = createHead()
    ctx.app.use(head)
  }
  const plugin = SchemaOrgUnheadPlugin(config, () => {
    const route = ctx.router?.currentRoute.value
    if (!route)
      return {}
    return {
      url: route.path,
      ...route.meta,
    }
  })
  head.unhead.hooks.addHooks(plugin.hooks)
}
