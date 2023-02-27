import {getActiveHead, createHead} from 'unhead'
import {MetaInput, SchemaOrgUnheadPlugin} from "../src";
import {SchemaOrgNode} from "../src/types";

export async function injectSchemaOrg(): Promise<SchemaOrgNode[]> {
  // filter for schema.org tag
  const schemaOrg = (await getActiveHead()!.resolveTags()).find((tag) => tag.key === 'schema-org-graph')!.innerHTML
  return JSON.parse(<string> schemaOrg)['@graph']
}

export async function findNode<T>(id: string) {
  const nodes = await injectSchemaOrg()
  // @ts-expect-error untyped
  return nodes.find((node) => node['@id'] === id || node['@id'].endsWith(id)) as T
}
export async function useSetup(fn: () => void, meta: Partial<MetaInput> = {}) {
  createHead({
    plugins: [
      SchemaOrgUnheadPlugin({
          currency: 'AUD',
          host: 'https://example.com/',
          inLanguage: 'en-AU',
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
