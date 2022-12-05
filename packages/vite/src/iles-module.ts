import { SchemaOrgResolver } from '@unhead/schema-org-vue'
import type { SchemaOrgPluginOptions } from '@unhead/schema-org-vue'
import type { IlesModule } from 'iles'

export function schemaOrgIles(pluginOptions: SchemaOrgPluginOptions) {
  return <IlesModule> {
    name: '@vueuse-schema-org/schema-org-iles',
    components: {
      resolvers: [
        SchemaOrgResolver(),
      ],
    },
  }
}

