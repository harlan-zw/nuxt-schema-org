import type { ModuleOptions } from '../../src/module'
import type { ModuleRuntimeConfig } from '../../src/runtime/types'
import { mkdtemp, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadNuxt } from '@nuxt/kit'
import { expect, it } from 'vitest'
import NuxtSchemaOrg from '../../src/module'

it.each([false, true])('passes locale exclusions to runtime configuration with reactive=%s', async (reactive) => {
  const cwd = await mkdtemp(join(tmpdir(), 'schema-org-work-translations-'))
  const options: Partial<ModuleOptions> = {
    reactive,
    excludeWorkTranslationLocales: ['de', 'fr'],
  }
  try {
    await symlink(fileURLToPath(new URL('../../node_modules', import.meta.url)), join(cwd, 'node_modules'), 'dir')
    const nuxt = await loadNuxt({
      cwd,
      overrides: {
        dev: false,
        devtools: false,
        modules: [
          [NuxtSchemaOrg, options],
        ],
      },
    })
    try {
      const config = nuxt.options.runtimeConfig['nuxt-schema-org'] as ModuleRuntimeConfig
      expect(config.excludeWorkTranslationLocales).toEqual(['de', 'fr'])
      if (reactive) {
        const publicConfig = nuxt.options.runtimeConfig.public['nuxt-schema-org'] as ModuleRuntimeConfig
        expect(publicConfig.excludeWorkTranslationLocales).toEqual(['de', 'fr'])
      }
    }
    finally {
      await nuxt.close()
    }
  }
  finally {
    await rm(cwd, { recursive: true })
  }
}, 30_000)
