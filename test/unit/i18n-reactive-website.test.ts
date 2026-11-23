// @vitest-environment happy-dom
import type { App } from 'vue'
import { defineWebSite, UnheadSchemaOrg } from '@unhead/schema-org/vue'
import { useHead } from '@unhead/vue'
import { createHead, renderDOMHead } from '@unhead/vue/client'
import { expect, it, vi } from 'vitest'
import { createApp, nextTick, reactive } from 'vue'
import { localeWebsiteUrlKey, useSchemaOrg } from '../../src/runtime/app/composables/useSchemaOrg'

const context = vi.hoisted(() => ({ vueApp: undefined as App | undefined }))

vi.mock('nuxt/app', () => ({
  useHead: (...args: Parameters<typeof useHead>) => useHead(...args),
  useNuxtApp: () => ({ vueApp: context.vueApp }),
}))
vi.mock('../../src/runtime/app/utils/config', () => ({
  useSchemaOrgConfig: () => ({ reactive: true }),
}))

it('renders changes to website nodes in a reactive array', async () => {
  const websites = reactive([
    defineWebSite({ name: 'Original Website' }),
  ])
  const head = createHead({
    render: () => {},
  })
  head.use(UnheadSchemaOrg({ host: 'https://example.com/' }))
  const app = createApp({
    setup() {
      useSchemaOrg(websites)
      return () => null
    },
  })
  context.vueApp = app
  app.provide(localeWebsiteUrlKey, () => 'https://example.com/en')
  app.use(head)
  app.mount(document.createElement('div'))
  try {
    renderDOMHead(head)
    const getWebSite = () => JSON.parse(document.querySelector('script[type="application/ld+json"]')!.textContent!)['@graph'][0]

    expect(getWebSite()).toMatchObject({
      '@id': 'https://example.com/en#website',
      'name': 'Original Website',
    })
    websites[0]!.name = 'Updated Website'
    await nextTick()
    renderDOMHead(head)
    expect(getWebSite()).toMatchObject({
      '@id': 'https://example.com/en#website',
      'name': 'Updated Website',
    })
  }
  finally {
    app.unmount()
    document.querySelector('script[type="application/ld+json"]')?.remove()
  }
})
