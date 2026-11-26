import type { NuxtApp } from 'nuxt/app'
import { defineWebPage } from '@unhead/schema-org/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, ref } from 'vue'
import { useSchemaOrg } from '../../src/runtime/app/composables/useSchemaOrg'
import defaultsPlugin from '../../src/runtime/app/plugins/defaults'
import i18nDefaultsPlugin from '../../src/runtime/app/plugins/i18n/defaults'
import i18nInitPlugin from '../../src/runtime/app/plugins/i18n/init'
import i18nMetaPlugin from '../../src/runtime/app/plugins/i18n/meta'
import initPluginModule from '../../src/runtime/app/plugins/init'

const state = vi.hoisted(() => ({
  error: undefined as Record<string, unknown> | undefined,
  nuxtApp: undefined as Record<string, any> | undefined,
  headCalls: [] as unknown[],
  initPluginCalls: 0,
  initSchemaOrgHeadCalls: 0,
  initSchemaOrgMetaCalls: 0,
  identityCalls: 0,
}))

vi.mock('nuxt/app', () => ({
  defineNuxtPlugin: (plugin: { setup: unknown }) => plugin.setup,
  injectHead: () => ({}),
  useError: () => ({ value: state.error }),
  useHead: (input: unknown) => {
    state.headCalls.push(input)
    return undefined
  },
  useNuxtApp: () => state.nuxtApp,
  useRoute: () => ({ path: '/missing' }),
  useRuntimeConfig: () => ({
    public: {
      i18n: { defaultLocale: 'en' },
    },
    app: { baseURL: '/' },
  }),
}))

vi.mock('#i18n', () => ({
  useLocalePath: () => () => '/',
}))

vi.mock('#site-config/app/composables/useSiteConfig', () => ({
  useSiteConfig: () => ({
    name: 'Example',
    description: 'Example description',
    url: 'https://example.com',
    trailingSlash: false,
  }),
}))

vi.mock('#site-config/app/composables/utils', () => ({
  createSitePathResolver: () => () => ({ value: 'https://example.com/' }),
}))

vi.mock('../../src/runtime/app/utils/config', () => ({
  useSchemaOrgConfig: () => ({ reactive: true }),
}))

vi.mock(import('../../src/runtime/app/utils/shared'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    initPlugin: () => {
      state.initPluginCalls++
    },
    initSchemaOrgHead: () => {
      state.initSchemaOrgHeadCalls++
    },
    initSchemaOrgMeta: () => {
      state.initSchemaOrgMetaCalls++
    },
    maybeAddIdentitySchemaOrg: () => {
      state.identityCalls++
    },
  }
})

function createMockNuxtApp() {
  const nuxtApp: Record<string, any> = {
    vueApp: createSSRApp({}),
    runWithContext: (fn: () => unknown) => fn(),
    $i18n: {
      defaultLocale: 'en',
      locales: ref([
        { code: 'en', language: 'en-US' },
      ]),
      localeProperties: ref({ code: 'en', language: 'en-US' }),
      strategy: 'prefix',
    },
  }
  state.nuxtApp = nuxtApp
  return nuxtApp as unknown as NuxtApp
}

const nuxt404Error = {
  status: 404,
  statusCode: 404,
  statusText: 'Page Not Found',
  statusMessage: 'Page Not Found',
  message: 'Page not found: /missing',
  fatal: false,
  unhandled: false,
  url: '/missing',
}

describe('error page handling', () => {
  beforeEach(() => {
    state.error = undefined
    state.headCalls = []
    state.initPluginCalls = 0
    state.initSchemaOrgHeadCalls = 0
    state.initSchemaOrgMetaCalls = 0
    state.identityCalls = 0
  })

  it('skips defaults plugin when useError().value is a NuxtError without an .error property', async () => {
    state.error = nuxt404Error
    const nuxtApp = createMockNuxtApp()

    await (defaultsPlugin as unknown as (app: NuxtApp) => Promise<void> | void)(nuxtApp)

    expect(state.headCalls).toHaveLength(0)
    expect(state.identityCalls).toBe(0)
  })

  it('registers defaults plugin normally when no error is present', async () => {
    const nuxtApp = createMockNuxtApp()

    await (defaultsPlugin as unknown as (app: NuxtApp) => Promise<void> | void)(nuxtApp)

    expect(state.headCalls).toHaveLength(1)
    expect(state.identityCalls).toBe(1)
  })

  it('skips i18n defaults plugin when useError().value is a NuxtError', async () => {
    state.error = nuxt404Error
    const nuxtApp = createMockNuxtApp()

    await (i18nDefaultsPlugin as unknown as (app: NuxtApp) => Promise<void> | void)(nuxtApp)

    expect(state.headCalls).toHaveLength(0)
    expect(state.identityCalls).toBe(0)
  })

  it('skips eager initPlugin on error pages and initializes lazily on explicit useSchemaOrg()', async () => {
    state.error = nuxt404Error
    const nuxtApp = createMockNuxtApp()

    await (initPluginModule as unknown as (app: NuxtApp) => Promise<void> | void)(nuxtApp)
    expect(state.initPluginCalls).toBe(0)

    useSchemaOrg([
      defineWebPage({ name: '404' }),
    ])
    expect(state.initPluginCalls).toBe(1)
    expect(state.headCalls).toHaveLength(1)

    // Subsequent calls do not re-run deferred init.
    useSchemaOrg([
      defineWebPage({ name: '404 again' }),
    ])
    expect(state.initPluginCalls).toBe(1)
  })

  it('skips eager i18n init and meta plugins on error pages and initializes lazily on explicit useSchemaOrg()', async () => {
    state.error = nuxt404Error
    const nuxtApp = createMockNuxtApp()

    await (i18nInitPlugin as unknown as (app: NuxtApp) => Promise<void> | void)(nuxtApp)
    await (i18nMetaPlugin as unknown as (app: NuxtApp) => Promise<void> | void)(nuxtApp)
    expect(state.initSchemaOrgHeadCalls).toBe(0)
    expect(state.initSchemaOrgMetaCalls).toBe(0)

    useSchemaOrg([
      defineWebPage({ name: '404' }),
    ])
    expect(state.initSchemaOrgHeadCalls).toBe(1)
    expect(state.initSchemaOrgMetaCalls).toBe(1)
  })
})
