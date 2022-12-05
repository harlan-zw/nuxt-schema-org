// Simple alias to avoid breaking changes
import { schemaAutoImports } from '@unhead/schema-org-vue'

export * from '@unhead/schema-org-vue'

export const schemaOrgAutoImports = {
  ['@unhead/schema-org-vue']: schemaAutoImports,
}
