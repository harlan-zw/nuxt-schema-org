import type { HeadPlugin } from '@unhead/schema'
import { loadResolver } from './resolver'
import type { MetaInput, UserConfig } from './types'
import {
  createSchemaOrgGraph,
} from '.'
import type { SchemaOrgGraph } from '.'

export function SchemaOrgUnheadPlugin(config: UserConfig, meta: () => Record<string, any>): any {
  let graph: SchemaOrgGraph
  let resolvedMeta: MetaInput
  return <HeadPlugin> ({
    hooks: {
      'entries:resolve': function () {
        graph = createSchemaOrgGraph()
        resolvedMeta = { ...meta(), ...config }
      },
      'tag:normalise': async function ({ tag }) {
        if (tag.key === 'schema-org-graph') {
          const nodes = await tag.props.nodes
          for (const node of Array.isArray(nodes) ? nodes : [nodes]) {
            const newNode = {
              ...node,
              _resolver: loadResolver(await node._resolver),
            }
            graph.push(newNode)
          }
          tag.tagPosition = config.position === 'head' ? 'head' : 'bodyClose'
        }
        if (tag.tag === 'title')
          resolvedMeta.title = tag.children
        else if (tag.tag === 'meta' && tag.props.name === 'description')
          resolvedMeta.description = tag.props.content
        else if (tag.tag === 'link' && tag.props.rel === 'canonical')
          resolvedMeta.url = tag.props.href
        else if (tag.tag === 'meta' && tag.props.property === 'og:image')
          resolvedMeta.image = tag.props.content
      },
      'tags:resolve': async function (ctx) {
        // find the schema.org node
        for (const tag of ctx.tags) {
          if (tag.tag === 'script' && tag.key === 'schema-org-graph') {
            graph.meta = { ...graph.meta, ...resolvedMeta }
            tag.children = JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': graph.resolveGraph(),
            }, null, 2)
            delete tag.props.nodes
          }
        }
      },
    },
  })
}
