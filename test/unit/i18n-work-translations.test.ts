import type { NuxtApp } from 'nuxt/app'
import { describe, expect, it, vi } from 'vitest'
import { ref, toValue } from 'vue'
import defaults from '../../src/runtime/app/plugins/i18n/defaults'

const context = vi.hoisted(() => ({
  config: {} as { excludeWorkTranslationLocales?: string[] },
  nodes: [] as Record<string, any>[],
}))

vi.mock('nuxt/app', () => ({
  defineNuxtPlugin: (plugin: { setup: unknown }) => plugin.setup,
  useError: () => ({ value: null }),
  useRoute: () => ({ path: '/' }),
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
  useSiteConfig: () => ({ name: 'Example', url: 'https://example.com', trailingSlash: true }),
}))
vi.mock('#site-config/app/composables/utils', () => ({
  createSitePathResolver: () => () => ({ value: 'https://example.com/' }),
}))
vi.mock('../../src/runtime/app/utils/config', () => ({
  useSchemaOrgConfig: () => context.config,
}))
vi.mock('../../src/runtime/app/utils/shared', () => ({
  maybeAddIdentitySchemaOrg: () => {},
}))
vi.mock('../../src/runtime/app/composables/useSchemaOrg', () => ({
  useSchemaOrg: (nodes: Record<string, any>[]) => { context.nodes = nodes },
}))

const locales = [
  { code: 'en', language: 'en-US', domain: 'example.com' },
  { code: 'de', language: 'de-DE', domain: 'other-brand.example' },
  { code: 'fr', language: 'fr-FR', domain: 'fr.example.com' },
]

async function render(excluded?: string[], currentLocale = 'en') {
  context.config = { excludeWorkTranslationLocales: excluded }
  context.nodes = []
  await defaults({
    $i18n: {
      defaultLocale: 'en',
      locales: ref(locales),
      localeProperties: ref(locales.find(locale => locale.code === currentLocale)),
      strategy: 'no_prefix',
    },
  } as unknown as NuxtApp)
  return context.nodes[0]
}

function translationIds(website: Record<string, any>) {
  return website.workTranslation?.map((translation: { '@id': () => string }) => toValue(translation['@id']))
}

describe('automatic workTranslation locale exclusions', () => {
  it.each([
    { excluded: undefined },
    { excluded: [] as string[] },
  ])('keeps canonical cross-domain IDs when exclusions are $excluded', async ({ excluded }) => {
    expect(translationIds(await render(excluded))).toEqual([
      'https://other-brand.example/#website',
      'https://fr.example.com/#website',
    ])
  })

  it('excludes a locale by code and retains the other canonical ID', async () => {
    expect(translationIds(await render(['de']))).toEqual(['https://fr.example.com/#website'])
  })

  it('omits workTranslation when all translations are excluded', async () => {
    expect((await render(['de', 'fr'])).workTranslation).toBeUndefined()
  })

  it('ignores unknown codes and language tags', async () => {
    expect(translationIds(await render(['unknown', 'de-DE']))).toEqual([
      'https://other-brand.example/#website',
      'https://fr.example.com/#website',
    ])
  })

  it('keeps the default WebSite and WebPage when translations are excluded', async () => {
    const website = await render(['en', 'de', 'fr'])
    expect(toValue(website['@id'])).toBe('https://example.com/#website')
    expect(context.nodes[1].isPartOf).toEqual({ '@id': 'https://example.com/#website' })
  })

  it('leaves translationOfWork on excluded locale websites unchanged', async () => {
    const website = await render(['de'], 'de')
    expect(toValue(website['@id'])).toBe('https://other-brand.example/#website')
    expect(toValue(website.translationOfWork['@id'])).toBe('https://example.com/#website')
  })
})
