import { resolve } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils'
import { load } from 'cheerio'
import { describe, expect, it } from 'vitest'

// Guards Unhead v2 compatibility: this fixture installs a coherent v2 stack
// (Nuxt 4.2 / @unhead/vue@2 / @unhead/schema-org@2). It verifies the module's
// cross-major code paths (feature-detected plugin, defineX identity, and the
// computed-ref node handling) all resolve correctly against unhead v2 core.
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

    // no junk/unresolved nodes leaked into the graph
    expect(graph.some(n => String(n['@id']).includes('#/schema//'))).toBe(false)
  })
})
