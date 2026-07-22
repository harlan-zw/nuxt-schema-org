export function buildSchemaOrgContentScript(schemaOrgInput: unknown, defineWebPage: (input?: any) => any, scriptAttributes?: Record<string, unknown> | false) {
  const nodes = Array.isArray(schemaOrgInput) ? schemaOrgInput : [defineWebPage(schemaOrgInput)]

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

  return {
    type: 'application/ld+json',
    key: 'schema-org-graph',
    nodes: nodes.map(replaceType),
    ...(scriptAttributes || {}),
  }
}
