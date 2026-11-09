import type { MetaInput, PluginSchemaOrgOptions } from '@unhead/schema-org'
import type { HeadPlugin, HeadTag, Unhead } from 'unhead/types'
import { UnheadSchemaOrg } from '@unhead/schema-org/vue'
import { compileTags, readEntry } from 'unhead/compiled'
import { capoTagWeight } from 'unhead/server'
import { dedupeKey, dedupeTags, normalizeEntryToTags, processTemplateParams, resolveTitleTemplate } from 'unhead/utils'
import { SCHEMA_ORG_GRAPH_KEY } from '../../utils/graphScript'

/**
 * The graph of a request under compiler mode. Each `useSchemaOrg()` entry holds compiled tags,
 * and its input, with the nodes, waits here under the index of its entry. The first entry renders
 * the graph script; the others render nothing and keep the place of their nodes in the entry order.
 * The Schema.org meta template param waits here too, with the route keys its compiled tags leave out.
 */
export interface GraphState {
  inputs: Map<number, object>
  holder?: number
  options: PluginSchemaOrgOptions
  computing: boolean
}

export type GraphResult
  = | { _tag: 'Graph', html: string }
    | { _tag: 'Empty' }
    | { _tag: 'Foreign', reason: string }

// Read each entry once per render: the per request head is the key, so no request state outlives it.
const states = new WeakMap<object, GraphState>()

export function graphState(head: object): GraphState {
  let state = states.get(head)
  if (!state) {
    states.set(head, state = {
      inputs: new Map(),
      options: {},
      computing: false,
    })
  }
  return state
}

export function isSchemaOrgTag(tag: HeadTag): boolean {
  return !!((tag.tag === 'script' && tag.props.type === 'application/ld+json' && tag.props.nodes) || tag.key === SCHEMA_ORG_GRAPH_KEY)
}

const TITLE_TAGS = new Set(['title', 'titleTemplate', 'templateParams'])

/**
 * The template params of the render, as `TemplateParamsPlugin` resolves them before the
 * Schema.org plugin writes the graph: the winning `templateParams`, without `separator`, and
 * `pageTitle`.
 */
export function resolveTemplateParams(tags: HeadTag[]): { params: Record<string, unknown>, separator: string } {
  const ctx = {
    tagMap: new Map<string, HeadTag>(),
    tags,
  }
  dedupeTags(ctx as any)
  // The template params plugin is in place, so `resolveTitleTemplate` leaves `%s` to it
  const head = {
    plugins: new Map([
      ['template-params', {}],
    ]),
  } as unknown as Unhead<any> & { _title?: string }
  resolveTitleTemplate(ctx as any, head)
  const params: Record<string, unknown> = {
    ...ctx.tagMap.get('templateParams')?.props,
  }
  const separator = (params.separator as string) || '|'
  delete params.separator
  const pageTitle = (params.pageTitle as string) || head._title || ''
  params.pageTitle = pageTitle.includes('%')
    ? processTemplateParams(pageTitle, params as any, separator)
    : pageTitle
  return { params, separator }
}

/**
 * Resolves the graph of a head without render hooks. It feeds the normalized tags of every entry,
 * in entry order, to the hooks of an Unhead Schema.org plugin that is not registered, as the
 * full runtime does at its render. So the graph is the one the plugin writes.
 *
 * `own` holds the input of each `useSchemaOrg()` entry. An ld+json entry with nodes that the
 * module does not own returns `Foreign`: only the registered plugin merges its script.
 */
export function resolveGraph(head: Unhead<any>, own: Map<number, object>, options: PluginSchemaOrgOptions): GraphResult {
  const graphHead = {
    use() {},
    _templateParams: undefined as Record<string, unknown> | undefined,
    _separator: undefined as string | undefined,
  }
  const plugin = (UnheadSchemaOrg({} as MetaInput, undefined, options) as unknown as (head: unknown) => HeadPlugin)(graphHead)
  const hooks = plugin.hooks as Record<string, (ctx: any) => void>
  // Creates the graph, as the first hook of a render does
  hooks['entries:resolve']!({
    entries: [],
    tagMap: new Map(),
    tags: [],
  })
  const propResolvers = head.resolvedOptions.propResolvers || []
  const titleTags: HeadTag[] = []
  for (const entry of head.entries.values()) {
    const input = own.get(entry._i)
    // An entry the module owns is not read: the read of the graph holder would run its value again.
    // Its input holds the nodes as the call gave them, so a Vue ref in a node resolves here.
    // `readEntry` already resolves the input of any other entry.
    const tags = input
      ? normalizeEntryToTags(input as any, propResolvers)
      : normalizeEntryToTags(readEntry(entry, head).input as any, [])
    if (!input && tags.some(isSchemaOrgTag))
      return { _tag: 'Foreign', reason: `entry ${entry._i} holds an ld+json script with nodes` }
    if (entry.options && Object.keys(entry.options).length) {
      for (const tag of tags)
        Object.assign(tag, entry.options)
    }
    hooks['entries:normalize']!({ tags, entry })
    tags.forEach((tag, i) => {
      if (!TITLE_TAGS.has(tag.tag))
        return
      tag._w = capoTagWeight(tag)
      tag._p = (entry._i << 10) + i
      tag._d = dedupeKey(tag)
      titleTags.push(tag)
    })
  }
  const { params, separator } = resolveTemplateParams(titleTags)
  graphHead._templateParams = params
  graphHead._separator = separator
  const script = {
    tag: 'script',
    props: { type: 'application/ld+json', nodes: true },
    key: SCHEMA_ORG_GRAPH_KEY,
  } as unknown as HeadTag
  hooks['tags:resolve']!({
    tags: [script],
    tagMap: new Map(),
  })
  return typeof script.innerHTML === 'string'
    ? { _tag: 'Graph', html: script.innerHTML }
    : { _tag: 'Empty' }
}

/** A head that takes compiled tags, whose entries may hold a value function. */
export type CompiledHead = Omit<Unhead<any>, 'push'> & {
  push: (input: unknown, options?: { values?: () => unknown[] }) => { _i: number }
}

// The entries after the first render no tag, so they share one set of compiled tags.
const NO_TAGS: unknown[] = []

/**
 * Pushes the input of a `useSchemaOrg()` call on a compiled server head. The first call pushes the
 * compiled graph script, whose value resolves the graph at the head render. If an entry the module
 * does not own holds nodes, every entry takes back its input and the head takes the plugin, so the
 * output stays the one of the plugin.
 */
export function pushGraphInput(head: CompiledHead, graphTags: unknown, input: object): { _i: number } {
  const state = graphState(head)
  if (state.holder !== undefined && head.entries.has(state.holder)) {
    const entry = head.push(NO_TAGS)
    state.inputs.set(entry._i, input)
    return entry
  }
  const entry = head.push(graphTags, {
    values: () => {
      // A reader of this entry inside the graph read sees no graph yet. The outer read sets it.
      if (state.computing)
        return ['']
      state.computing = true
      let result: GraphResult
      try {
        result = resolveGraph(head as unknown as Unhead<any>, state.inputs, state.options)
      }
      finally {
        state.computing = false
      }
      if (result._tag === 'Graph')
        return [result.html]
      const holder = head.entries.get(entry._i)!
      if (result._tag === 'Empty') {
        // The plugin removes the script when the graph has no node
        holder.input = {}
        return []
      }
      for (const [i, own] of state.inputs)
        head.entries.get(i)!.input = own
      head.use(UnheadSchemaOrg({} as MetaInput, undefined, state.options))
      return []
    },
  })
  state.holder = entry._i
  state.inputs.set(entry._i, input)
  return entry
}

// The route keys of the Schema.org meta. The compiled tags leave them out, so every route of a site shares them.
const ROUTE_KEYS = new Set(['path', 'url'])
// Compiled tags by site meta. A site has one per locale, so a full cache means the meta changes per
// route: compiled tags per route would hold one server memo per route, so the meta stays loose input.
const MAX_SITE_METAS = 16
const siteMetaTags = new Map<string, unknown>()

function siteMetaCompiledTags(meta: Record<string, unknown>): unknown {
  const site: Record<string, unknown> = {}
  for (const key in meta) {
    if (!ROUTE_KEYS.has(key))
      site[key] = meta[key]
  }
  const key = JSON.stringify(site)
  if (!siteMetaTags.has(key) && siteMetaTags.size < MAX_SITE_METAS) {
    const result = compileTags({
      templateParams: { schemaOrg: site },
    })
    siteMetaTags.set(key, result._tag === 'Ok'
      ? result.tags
      : undefined)
  }
  return siteMetaTags.get(key)
}

/**
 * Sets the Schema.org meta template param of a compiled server head. The entry holds compiled tags
 * of the site meta, which every route shares, so the head keeps the server memo. The graph reads the
 * whole meta, with `path` and `url`, from the graph state. Meta that cannot compile stays loose input.
 */
export function patchSchemaOrgMeta(head: CompiledHead, entry: { _i: number, patch: (input: any) => void }, meta: Record<string, unknown>): void {
  const input = {
    templateParams: { schemaOrg: meta },
  }
  const tags = siteMetaCompiledTags(meta)
  if (!tags) {
    entry.patch(input)
    return
  }
  graphState(head).inputs.set(entry._i, input)
  entry.patch(tags)
}
