import { resolve } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils'
import { load } from 'cheerio'
import { describe, expect, it } from 'vitest'

// Production builds always minify, so only a dev server shows whether the
// `minify` module option reaches the v2 plugin.
await setup({
  rootDir: resolve(import.meta.dirname),
  server: true,
  browser: false,
  dev: true,
})

describe('unhead v2 plugin options', () => {
  it('passes minify to the v2 plugin', async () => {
    const html = await $fetch('/')
    const json = load(html as string)('script[type="application/ld+json"]').text()
    expect(json).toContain('"@graph"')
    expect(json).not.toContain('\n')
  })
})
