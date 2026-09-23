import type { Unhead } from 'unhead/types'

/**
 * Describes each root node of a rendered schema.org graph that has no `@type`.
 *
 * Only a raw object passed to `useSchemaOrg()` can reach the graph without a
 * type: every `defineX()` resolver sets one. Search engines ignore an untyped
 * node, so the module warns about it in development.
 */
export function describeUntypedSchemaOrgNodes(rendered: unknown): string[] {
  const nodes = (rendered as { '@graph'?: unknown } | null)?.['@graph']
  if (!Array.isArray(nodes))
    return []
  const messages: string[] = []
  for (const node of nodes) {
    if (!node || typeof node !== 'object' || node['@type'])
      continue
    const id = typeof node['@id'] === 'string' ? node['@id'] : '(no @id)'
    messages.push('@graph' in node
      ? `Node "${id}" holds a complete JSON-LD document ("@graph"). Pass the items of its "@graph" array to useSchemaOrg() instead.`
      : `Node "${id}" has no "@type", so search engines ignore it. Add "@type", or build it with a define function such as defineLocalBusiness().`)
  }
  return messages
}

/**
 * Warns once per message about untyped root nodes. Development only.
 */
export function warnOnUntypedSchemaOrgNodes(head: Pick<Unhead<any>, 'hooks'>) {
  const warned = new Set<string>()
  head.hooks?.hook('tags:afterResolve', ({ tags }) => {
    const graphTag = tags.find(tag => tag.key === 'schema-org-graph' && typeof tag.innerHTML === 'string')
    if (!graphTag)
      return
    for (const message of describeUntypedSchemaOrgNodes(JSON.parse(graphTag.innerHTML as string))) {
      if (warned.has(message))
        continue
      warned.add(message)
      console.warn(`[nuxt-schema-org] ${message}`)
    }
  })
}
