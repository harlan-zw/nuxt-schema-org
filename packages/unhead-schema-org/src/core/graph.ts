import type { Arrayable, Id, ResolvedMeta, SchemaOrgNode, Thing } from '../types'
import { asArray, resolveAsGraphKey } from '../utils'
import { imageResolver } from '../nodes'
import { resolveMeta, resolveNode, resolveNodeId, resolveRelation } from './resolve'
import { dedupeNodes } from './util'

export interface SchemaOrgGraph {
  nodes: SchemaOrgNode[]
  meta: ResolvedMeta
  push: <T extends Arrayable<Thing>>(node: T) => void
  resolveGraph: () => SchemaOrgNode[]
  find: <T extends Thing>(id: Id | string) => T | null
}

export const createSchemaOrgGraph = (): SchemaOrgGraph => {
  const nodes: SchemaOrgNode[] = []
  const meta = {} as ResolvedMeta
  const ctx: SchemaOrgGraph = {
    find<T extends Thing>(id: Id | string) {
      const key = resolveAsGraphKey(id) as Id
      return nodes
        .filter(n => !!n['@id'])
        .find(n => resolveAsGraphKey(n['@id'] as Id) === key) as unknown as T | null
    },
    push(input: Arrayable<Thing>) {
      asArray(input).forEach((node) => {
        const registeredNode = node as SchemaOrgNode
        nodes.push(registeredNode)
      })
    },
    resolveGraph() {
      ctx.meta = resolveMeta(ctx.meta)
      nodes
        .forEach((node, key) => {
          const resolver = node._resolver
          if (resolver) {
            node = resolveNode(node, ctx, resolver)
            node = resolveNodeId(node, ctx, resolver, true)
          }
          nodes[key] = node
        })

      nodes
        .forEach((node) => {
          // handle images for all nodes
          if (node.image && typeof node.image === 'string') {
            node.image = resolveRelation(node.image, ctx, imageResolver, {
              root: true,
            })
          }
          if (node._resolver?.resolveRootNode)
            node._resolver.resolveRootNode(node, ctx)

          // node is resolved, no longer need resolver
          delete node._resolver
        })

      return dedupeNodes(ctx.nodes)
    },
    nodes,
    meta,
  }
  return ctx
}
