import {getActiveHead, createHead} from 'unhead'
import {SchemaOrgUnheadPlugin} from "../src";
import {SchemaOrgNode} from "../src/types";

export async function injectSchemaOrg(): Promise<SchemaOrgNode[]> {
  // filter for schema.org tag
  const schemaOrg = (await getActiveHead()!.resolveTags()).find((tag) => tag.key === 'schema-org-graph')!.children
  return JSON.parse(<string> schemaOrg)['@graph']
}

export async function findNode<T>(id: string) {
  const nodes = await injectSchemaOrg()
  // @ts-expect-error untyped
  return nodes.find((node) => node['@id'] === id || node['@id'].endsWith(id)) as T
}
export async function useSetup(fn: () => void, meta: Record<string, any> = {}) {
  createHead({
    plugins: [
      SchemaOrgUnheadPlugin({
          defaultCurrency: 'AUD',
          canonicalHost: 'https://example.com/',
          defaultLanguage: 'en-AU',
          ...meta,
        },
        () => {
          return {
            path: '/',
            ...meta,
          }
        }
      )
    ]
  })
  return fn()
}
