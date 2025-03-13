import { defineWebPage, defineWebSite, useSchemaOrg } from '@unhead/schema-org/vue'

export function useSchemaOrgCustom() {
  useSchemaOrg([
    defineWebSite({
      name: 'My Awesome Website',
    }),
    defineWebPage(),
  ])
}
