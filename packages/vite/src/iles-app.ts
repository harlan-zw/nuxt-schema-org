import type { UserConfig } from '@unhead/schema-org-vue'
import type { EnhanceAppContext } from 'iles'

export function installSchemaOrg(ctx: EnhanceAppContext, config: UserConfig) {
  if (!config.canonicalHost)
    config.canonicalHost = ctx.site.url
}
