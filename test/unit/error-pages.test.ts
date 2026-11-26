import type { NuxtApp } from 'nuxt/app'
import { defineWebPage } from '@unhead/schema-org/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, inject, nextTick, ref } from 'vue'
import { localeWebsiteUrlKey, useSchemaOrg } from '../../src/runtime/app/composables/useSchemaOrg'
import defaultsPlugin from '../../src/runtime/app/plugins/defaults'
import i18nDefaultsPlugin from '../../src/runtime/app/plugins/i18n/defaults'
import i18nInitPlugin from '../../src/runtime/app/plugins/i18n/init'
import i18nMetaPlugin from '../../src/runtime/app/plugins/i18n/meta'
import initPluginModule from '../../src/runtime/app/plugins/init'

const state = vi.hoisted(() => ({
  error: undefined as any,
  nuxtApp: undefined as Record<string, any> | undefined,
  inNuxtContext: true,
  runWithContextCalls: 0,
  headCalls: [] as unknown[],
  headPlugins: [] as unknown[],
  headPushEntries: [] as Array<{ input: unknown, patches: unknown[] }>,
  identityCalls: 0,
}))

function requireNuxtContext() {
  if (!state.inNuxtContext)
    throw new Error('Nuxt composable called outside of Nuxt context')
}

vi.mock('nuxt/app', () => ({
  defineNuxtPlugin: (plugin: { setup: unknown }) => plugin.setup,
  injectHead: () => ({
    use: (plugin: unknown) => {
      state.headPlugins.push(plugin)
    },
    push: (input: unknown) => {
      const entry = { input, patches: [] as unknown[] }
      state.headPushEntries.push(entry)
      return {
        patch: (next: unknown) => {
          entry.patches.push(next)
        },
      }
    },
  }),
  useError: () => state.error,
  useHead: (input: unknown) => {
    requireNuxtContext()
    state.headCalls.push(input)
    return undefined
  },
  useNuxtApp: () => {
    requireNuxtContext()
    return state.nuxtApp
  },
  useRoute: () => {
    requireNuxtContext()
    return { path: '/missing', meta: {} }
  },
  useRuntimeConfig: () => {
    requireNuxtContext()
    return {
      public: {
        i18n: { defaultLocale: 'en' },
      },
      app: { baseURL: '/' },
    }
  },
}))

vi.mock('#i18n', () => ({
  useLocalePath: () => {
    requireNuxtContext()
    return () => '/'
  },
}))

vi.mock('#site-config/app/composables/useSiteConfig', () => ({
  useSiteConfig: () => {
    requireNuxtContext()
    return {
      name: 'Example',
      description: 'Example description',
      url: 'https://example.com',
      trailingSlash: false,
    }
  },
}))

vi.mock('#site-config/app/composables/utils', async () => {
  const { ref } = await import('vue')
  return {
    createSitePathResolver: () => {
      requireNuxtContext()
      return (path: string) => ref(`https://example.com${path}`)
    },
  }
})

vi.mock('../../src/runtime/app/utils/config', () => ({
  useSchemaOrgConfig: () => {
    requireNuxtContext()
    return { reactive: true, minify: false }
  },
}))

vi.mock(import('../../src/runtime/app/utils/shared'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    maybeAddIdentitySchemaOrg: () => {
      requireNuxtContext()
      state.identityCalls++
    },
  }
})

function createMockHooks() {
  const listeners = new Map<string, Array<(...args: any[]) => unknown>>()
  return {
    hook(name: string, fn: (...args: any[]) => unknown) {
      const list = listeners.get(name) || []
      list.push(fn)
      listeners.set(name, list)
    },
    hookOnce(name: string, fn: (...args: any[]) => unknown) {
      const wrapper = async (...args: any[]) => {
        const list = listeners.get(name) || []
        const idx = list.indexOf(wrapper)
        if (idx !== -1)
          list.splice(idx, 1)
        return await fn(...args)
      }
      this.hook(name, wrapper)
    },
    async callHook(name: string, ...args: any[]) {
      const list = [
        ...(listeners.get(name) || []),
      ]
      for (const fn of list)
        await fn(...args)
    },
  }
}

function createMockNuxtApp() {
  const nuxtApp: Record<string, any> = {
    vueApp: createSSRApp({}),
    hooks: createMockHooks(),
    runWithContext: <T>(fn: () => T) => {
      state.runWithContextCalls++
      const prev = state.inNuxtContext
      state.inNuxtContext = true
      try {
        return fn()
      }
      finally {
        state.inNuxtContext = prev
      }
    },
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
    state.error = ref<Record<string, unknown> | undefined>(undefined)
    state.inNuxtContext = true
    state.runWithContextCalls = 0
    state.headCalls = []
    state.headPlugins = []
    state.headPushEntries = []
    state.identityCalls = 0
  })

  it('skips defaults plugin when useError().value is a NuxtError without an .error property', async () => {
    state.error.value = nuxt404Error
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

  it('recovers defaults once on the client when error is cleared via clearError()', async () => {
    state.error.value = nuxt404Error
    const nuxtApp = createMockNuxtApp()

    await (defaultsPlugin as unknown as (app: NuxtApp) => Promise<void> | void)(nuxtApp)
    expect(state.headCalls).toHaveLength(0)
    expect(state.identityCalls).toBe(0)

    // Leave plugin setup context to ensure watcher restores Nuxt context via runWithContext.
    state.inNuxtContext = false

    // Replacing with another error must not register defaults.
    state.error.value = { ...nuxt404Error, statusCode: 500 }
    await nextTick()
    expect(state.headCalls).toHaveLength(0)
    expect(state.identityCalls).toBe(0)

    // Clearing the error registers defaults once.
    state.error.value = undefined
    await nextTick()
    expect(state.headCalls).toHaveLength(1)
    expect(state.identityCalls).toBe(1)
    expect(state.runWithContextCalls).toBeGreaterThan(0)

    // Subsequent error/clear transitions do not register defaults again.
    state.error.value = nuxt404Error
    await nextTick()
    state.error.value = undefined
    await nextTick()
    expect(state.headCalls).toHaveLength(1)
    expect(state.identityCalls).toBe(1)
  })

  it('skips i18n defaults plugin when errored and recovers defaults plus localeWebsiteUrlKey once on clearError()', async () => {
    state.error.value = nuxt404Error
    const nuxtApp = createMockNuxtApp()

    await (i18nDefaultsPlugin as unknown as (app: NuxtApp) => Promise<void> | void)(nuxtApp)

    expect(state.headCalls).toHaveLength(0)
    expect(state.identityCalls).toBe(0)
    expect(nuxtApp.vueApp.runWithContext(() => inject(localeWebsiteUrlKey, undefined))).toBeUndefined()

    state.inNuxtContext = false

    // Clearing the error registers i18n defaults and provides localeWebsiteUrlKey once.
    state.error.value = undefined
    await nextTick()
    expect(state.headCalls).toHaveLength(1)
    expect(state.identityCalls).toBe(1)
    const providedUrl = nuxtApp.vueApp.runWithContext(() => inject(localeWebsiteUrlKey, undefined))
    expect(providedUrl).toBeTypeOf('function')
    expect(providedUrl!()).toBe('https://example.com/')

    // Subsequent error/clear transitions do not register defaults again.
    state.error.value = nuxt404Error
    await nextTick()
    state.error.value = undefined
    await nextTick()
    expect(state.headCalls).toHaveLength(1)
    expect(state.identityCalls).toBe(1)
  })

  it('keeps init eager on error pages so schema-org:meta patches templateParams when error.vue calls useSchemaOrg() after app:created', async () => {
    state.error.value = nuxt404Error
    const nuxtApp = createMockNuxtApp()
    const metaHookSpy = vi.fn((meta: Record<string, any>) => {
      meta.title = 'Custom 404 Title'
      meta.url = 'https://patched.example.com/missing'
    })
    nuxtApp.hooks.hook('schema-org:meta' as any, metaHookSpy)

    await (initPluginModule as unknown as (app: NuxtApp) => Promise<void> | void)(nuxtApp)
    expect(state.headPlugins).toHaveLength(1)
    expect(state.headPushEntries).toHaveLength(1)
    expect(state.headCalls).toHaveLength(0)

    await nuxtApp.hooks.callHook('app:created' as any)
    expect(metaHookSpy).toHaveBeenCalledTimes(1)
    expect(state.headPushEntries[0]!.patches).toEqual([
      {
        templateParams: {
          schemaOrg: expect.objectContaining({
            title: 'Custom 404 Title',
            url: 'https://patched.example.com/missing',
            host: 'https://patched.example.com/',
            path: '/missing',
          }),
        },
      },
    ])

    useSchemaOrg([
      defineWebPage({ name: '404' }),
    ])
    expect(state.headCalls).toHaveLength(1)
  })

  it('keeps i18n init and meta eager on error pages so schema-org:meta patches templateParams when error.vue calls useSchemaOrg() after app:created', async () => {
    state.error.value = nuxt404Error
    const nuxtApp = createMockNuxtApp()
    const metaHookSpy = vi.fn((meta: Record<string, any>) => {
      meta.title = 'Custom i18n 404 Title'
    })
    nuxtApp.hooks.hook('schema-org:meta' as any, metaHookSpy)

    await (i18nInitPlugin as unknown as (app: NuxtApp) => Promise<void> | void)(nuxtApp)
    await (i18nMetaPlugin as unknown as (app: NuxtApp) => Promise<void> | void)(nuxtApp)
    expect(state.headPlugins).toHaveLength(1)
    expect(state.headPushEntries).toHaveLength(1)
    expect(state.headCalls).toHaveLength(0)

    await nuxtApp.hooks.callHook('app:created' as any)
    expect(metaHookSpy).toHaveBeenCalledTimes(1)
    expect(state.headPushEntries[0]!.patches).toEqual([
      {
        templateParams: {
          schemaOrg: expect.objectContaining({
            title: 'Custom i18n 404 Title',
          }),
        },
      },
    ])

    useSchemaOrg([
      defineWebPage({ name: '404' }),
    ])
    expect(state.headCalls).toHaveLength(1)
  })
})
