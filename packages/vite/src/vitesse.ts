// import { createSchemaOrg } from '@vueuse/schema-org'
import type { ViteSSGContext } from 'vite-ssg'
import type { UserConfig } from '@unhead/schema-org-vue'
import { SchemaOrgUnheadPlugin } from '@unhead/schema-org-vue'

export function installSchemaOrg(ctx: ViteSSGContext, config: UserConfig) {
  const plugin = SchemaOrgUnheadPlugin(config, () => {
    return {
      url: ctx.routePath,
      ...ctx.router.currentRoute.value?.meta,
    }
  })
  ctx.head?.unhead.hooks.addHooks(plugin.hooks)
}
