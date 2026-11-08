/** The key of the script tag that holds the Schema.org graph. Every graph script shares it. */
export const SCHEMA_ORG_GRAPH_KEY = 'schema-org-graph'

/**
 * The graph script of `useSchemaOrg()`, without its nodes. `attributes` is the
 * `scriptAttributes` module option, which can override any key.
 */
export function graphScript(attributes: Record<string, unknown> | false | undefined): Record<string, unknown> {
  return {
    type: 'application/ld+json',
    key: SCHEMA_ORG_GRAPH_KEY,
    tagPriority: 'high',
    ...attributes,
  }
}

/**
 * The graph script as it renders: the Unhead Schema.org plugin moves it to the end of the body,
 * unless it has its own position, and writes the graph as its content.
 */
export function renderedGraphScript(attributes: Record<string, unknown> | false | undefined, innerHTML: string): { script: Record<string, unknown>[] } {
  const script = graphScript(attributes)
  return {
    script: [
      { ...script, tagPosition: script.tagPosition || 'bodyClose', innerHTML },
    ],
  }
}
