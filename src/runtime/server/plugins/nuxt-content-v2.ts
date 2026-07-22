// @ts-expect-error untyped
import type { ParsedContent } from '@nuxt/content'
import type { Script, UseHeadInput } from '@unhead/vue/types'
import type { UnheadAugmentation } from '../../types'
import { defineWebPage } from '@unhead/schema-org/vue'
import { defu } from 'defu'
import { defineNitroPlugin } from 'nitropack/runtime'
import { buildSchemaOrgContentScript } from '../../utils/content'
import { useSchemaOrgConfig } from '../utils/config'

export default defineNitroPlugin((nitroApp) => {
  const config = useSchemaOrgConfig()
  // @ts-expect-error untyped
  nitroApp.hooks.hook('content:file:afterParse', async (content: ParsedContent) => {
    if (content._draft || content._extension !== 'md' || content._partial || content.indexable === false || content.index === false)
      return

    if (!content.schemaOrg) {
      return
    }
    const script = buildSchemaOrgContentScript(content.schemaOrg, defineWebPage, config.scriptAttributes) as Script & UnheadAugmentation<any>['script']

    content.head = defu(<UseHeadInput<any>> {
      script: [script],
    }, content.head)
    return content
  })
})
