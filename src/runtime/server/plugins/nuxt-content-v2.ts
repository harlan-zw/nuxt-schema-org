import type { ParsedContent } from '@nuxt/content'
import type { DataKeys, ScriptBase, TagUserProperties } from '@unhead/schema'
import type { UseHeadInput } from '@unhead/vue/types'
import type { UnheadAugmentation } from '../../types'
import { defineWebPage } from '@unhead/schema-org'
import { defu } from 'defu'
import { defineNitroPlugin } from 'nitropack/runtime'
import { useSchemaOrgConfig } from '../utils/config'

export default defineNitroPlugin((nitroApp) => {
  const config = useSchemaOrgConfig()
  nitroApp.hooks.hook('content:file:afterParse', async (content: ParsedContent) => {
    if (content._draft || content._extension !== 'md' || content._partial || content.indexable === false || content.index === false)
      return

    if (!content.schemaOrg) {
      return
    }
    const nodes = Array.isArray(content.schemaOrg) ? content.schemaOrg : [defineWebPage(content.schemaOrg)]

    // we need to recursively go through all nodes and swap `type` for `@type`
    const replaceType = (node: any) => {
      if (node.type) {
        node['@type'] = node.type
        delete node.type
      }
      Object.entries(node).forEach(([, value]) => {
        if (typeof value === 'object') {
          replaceType(value)
        }
      })
      return node
    }

    const script: (ScriptBase & TagUserProperties & DataKeys) & UnheadAugmentation<any>['script'] = {
      type: 'application/ld+json',
      key: 'schema-org-graph',
      nodes: nodes.map(replaceType),
      ...config.scriptAttributes,
    }

    content.head = defu(<UseHeadInput<any>> {
      script: [script],
    }, content.head)
    return content
  })
})
