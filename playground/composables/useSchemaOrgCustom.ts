import { defineWebPage, defineWebSite, useSchemaOrg } from '#imports'

export function useSchemaOrgCustom() {
  useSchemaOrg([
    defineWebSite({
      name: 'My Awesome Website',
    }),
    defineWebPage(),
  ])
}
