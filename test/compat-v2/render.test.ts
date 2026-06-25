import { resolve } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils'
import { load } from 'cheerio'
import { describe, expect, it } from 'vitest'

// Guards Unhead v2 compatibility AND regression #114: this fixture installs a v2
// host (Nuxt 4.2 / @unhead/vue@2 / unhead@2) but does NOT pin @unhead/schema-org,
// so the module's own (hoisted v3) copy is present. Without the major-aligning
// alias, head resolution crashes with "Cannot read properties of undefined
// (reading 'potentialAction')" and the route 500s. A successful graph render
// proves the alias forced the v2 schema-org copy, and exercises the module's
// cross-major paths (feature-detected plugin, defineX identity, computed-ref).
await setup({
  rootDir: resolve(import.meta.dirname),
  server: true,
  browser: false,
})

async function fetchGraph(path: string) {
  const html = await $fetch(path)
  const $ = load(html as string)
  return JSON.parse($('script[type="application/ld+json"]').text())['@graph'] as any[]
}

describe('unhead v2 compatibility', () => {
  it('renders a complete graph with no unresolved nodes', async () => {
    const graph = await fetchGraph('/')
    const types = graph.map(n => n['@type'])

    // core nodes resolve
    expect(types).toContain('WebSite')
    expect(types).toContain('WebPage')

    // identity resolver (defineOrganization) sets the #identity node, proving
    // the v2 string `_resolver` path works
    const identity = graph.find(n => String(n['@id']).endsWith('#identity'))
    expect(identity?.['@type']).toBe('Organization')

    // computed-ref input resolves into a real Article node
    const article = graph.find(n => n['@type'] === 'Article')
    expect(article?.headline).toBe('Hello v2')

    // regression #129: v2 auto-imports advertise defineDataset and other v3-era
    // helpers, so the vendored v2 /vue entry must export and resolve them.
    const dataset = graph.find(n => n['@type'] === 'Dataset')
    expect(dataset?.name).toBe('Compat dataset')

    // no junk/unresolved nodes leaked into the graph
    expect(graph.some(n => String(n['@id']).includes('#/schema//'))).toBe(false)
  })
})
