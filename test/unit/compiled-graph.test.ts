import { defineArticle, definePerson, defineWebPage, defineWebSite, UnheadSchemaOrg } from '@unhead/schema-org'
import { VueResolver } from '@unhead/vue/utils'
import { compileTags, dynamicValue, readEntry } from 'unhead/compiled'
import { createHead as createCompiledHead } from 'unhead/compiled/server'
import { TemplateParamsPlugin } from 'unhead/plugins'
import { createHead, renderSSRHead } from 'unhead/server'
import { describe, expect, it } from 'vitest'
import { computed } from 'vue'
import { compileGraphScript } from '../../src/compiledGraph'
import { graphState, pushGraphInput } from '../../src/runtime/app/utils/compiledGraph'
import { graphScript } from '../../src/runtime/utils/graphScript'

const attributes = { 'data-nuxt-schema-org': true }
const options = { minify: true }
const compiled = compileGraphScript({ compileTags, dynamicValue }, attributes)
if (compiled._tag !== 'Ok')
  throw new Error(compiled.reason)
const graphTags = compiled.tags

const RENDER_HOOK_RE = /^(?:entries:[nr]|tags:|ssr:[br])/

/** `Compiled` is head input with one dynamic value, which a compiled head takes as compiled tags. */
type Step
  = | { _tag: 'Head', input: Record<string, unknown> }
    | { _tag: 'Compiled', input: (token: string) => Record<string, unknown>, value: string }
    | { _tag: 'Schema', nodes: unknown[] }
    | { _tag: 'Foreign', nodes: unknown[] }

function schemaInput(nodes: unknown[]) {
  return {
    script: [
      {
        ...graphScript(attributes),
        nodes,
      },
    ],
  }
}

/** The head without compiler mode: the Unhead Schema.org plugin writes the graph. */
function renderWithPlugin(steps: Step[]) {
  const head = createHead({
    disableDefaults: true,
    propResolvers: [VueResolver],
  })
  head.use(UnheadSchemaOrg({} as any, undefined, options))
  for (const step of steps) {
    head.push((step._tag === 'Head'
      ? step.input
      : step._tag === 'Compiled'
        ? step.input(step.value)
        : step._tag === 'Schema'
          ? schemaInput(step.nodes)
          : {
              script: [
                { type: 'application/ld+json', nodes: step.nodes },
              ],
            }) as any)
  }
  return renderSSRHead(head)
}

/** The head under compiler mode: `useSchemaOrg()` entries push the compiled graph script. */
function renderCompiled(steps: Step[], { readFirst = false } = {}) {
  const head = createCompiledHead({
    disableDefaults: true,
    propResolvers: [VueResolver],
  }) as any
  // as the init plugin does
  head.use(TemplateParamsPlugin)
  graphState(head).options = options
  for (const step of steps) {
    if (step._tag === 'Head') {
      head.push(step.input)
    }
    else if (step._tag === 'Compiled') {
      const result = compileTags(step.input(dynamicValue(0)), { dynamicValues: 1 })
      if (result._tag !== 'Ok')
        throw new Error(result.reason)
      head.push(result.tags, {
        values: () => [step.value],
      })
    }
    else if (step._tag === 'Schema') {
      pushGraphInput(head, graphTags, schemaInput(step.nodes))
    }
    else {
      head.push({
        script: [
          { type: 'application/ld+json', nodes: step.nodes },
        ],
      })
    }
  }
  if (readFirst) {
    for (const entry of [
      ...head.entries.values(),
    ])
      readEntry(entry, head)
  }
  const html = head.render()
  const hooks = head._hookStore?._hooks || {}
  const renderHooks = Object.keys(hooks).filter(name => RENDER_HOOK_RE.test(name) && hooks[name].some((listener: unknown) => !head._known?.has(listener)))
  return { html, renderHooks }
}

const site = [
  {
    _tag: 'Head',
    input: {
      templateParams: {
        schemaOrg: { host: 'https://example.com/', path: '/blog/post', inLanguage: 'en' },
        siteName: 'Site',
        separator: '-',
      },
    },
  },
  {
    _tag: 'Head',
    input: {
      titleTemplate: '%s %separator %siteName',
      link: [
        { rel: 'canonical', href: 'https://example.com/blog/post' },
      ],
    },
  },
  {
    _tag: 'Schema',
    nodes: [
      defineWebSite({ name: 'Site' }),
      defineWebPage(),
    ],
  },
] satisfies Step[]

describe('resolveGraph under compiler mode', () => {
  it('renders the graph of the plugin with no render hook', () => {
    const steps: Step[] = [
      ...site,
      {
        _tag: 'Head',
        input: {
          title: 'Post',
          meta: [
            { name: 'description', content: 'About the post' },
            { property: 'og:image', content: '/post.png' },
          ],
        },
      },
      {
        _tag: 'Schema',
        nodes: [
          defineArticle({ headline: 'Post', datePublished: '2026-11-01' }),
        ],
      },
    ]
    const { html, renderHooks } = renderCompiled(steps)
    expect(html).toEqual(renderWithPlugin(steps))
    expect(html.bodyTags).toContain('"@type":"Article"')
    expect(renderHooks).toEqual([])
  })

  it('resolves template params inside node strings', () => {
    const steps: Step[] = [
      ...site,
      {
        _tag: 'Head',
        input: {
          title: 'Brand %brand',
          templateParams: { brand: 'X' },
        },
      },
      {
        _tag: 'Schema',
        nodes: [
          defineWebPage({ name: '%brand page on %siteName, %pageTitle' }),
        ],
      },
    ]
    const { html } = renderCompiled(steps)
    expect(html).toEqual(renderWithPlugin(steps))
    expect(html.bodyTags).toContain('X page on Site, Brand X')
  })

  it('reads the value of a compiled entry into the graph', () => {
    const steps: Step[] = [
      ...site,
      {
        _tag: 'Compiled',
        input: token => ({
          title: token,
          meta: [
            { name: 'description', content: 'About the post' },
          ],
        }),
        value: 'Late title',
      },
      {
        _tag: 'Schema',
        nodes: [
          defineWebPage({ name: '%pageTitle' }),
        ],
      },
    ]
    const { html, renderHooks } = renderCompiled(steps)
    expect(html).toEqual(renderWithPlugin(steps))
    expect(html.bodyTags).toContain('"name":"Late title"')
    expect(renderHooks).toEqual([])
  })

  it('resolves a Vue ref inside a node, read early or at the render', () => {
    const headline = computed(() => 'Post from a ref')
    const steps: Step[] = [
      ...site,
      {
        _tag: 'Schema',
        nodes: [
          // A node takes a ref at runtime, as `useSchemaOrg()` in a page passes it
          defineArticle({ headline: headline as unknown as string, datePublished: '2026-11-01' }),
        ],
      },
    ]
    const expected = renderWithPlugin(steps)
    expect(expected.bodyTags).toContain('"headline":"Post from a ref"')
    expect(renderCompiled(steps).html).toEqual(expected)
    // Another module reads every entry before the render, as nuxt-seo-utils does at `app:rendered`
    expect(renderCompiled(steps, { readFirst: true }).html).toEqual(expected)
  })

  it('renders no script for a graph with no node', () => {
    const steps: Step[] = [
      ...site.slice(0, 2),
      { _tag: 'Schema', nodes: [] },
    ]
    const { html } = renderCompiled(steps)
    expect(html).toEqual(renderWithPlugin(steps))
    expect(html.bodyTags).not.toContain('ld+json')
  })

  it('takes the plugin when an entry it does not own holds nodes', () => {
    const steps: Step[] = [
      ...site,
      {
        _tag: 'Foreign',
        nodes: [
          definePerson({ name: 'Ada' }),
        ],
      },
    ]
    const { html, renderHooks } = renderCompiled(steps)
    expect(html).toEqual(renderWithPlugin(steps))
    expect(html.bodyTags).toContain('Ada')
    expect(renderHooks).not.toEqual([])
  })
})
