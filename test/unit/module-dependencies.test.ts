import { mkdtemp, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadNuxt } from '@nuxt/kit'
import { expect, it } from 'vitest'
import NuxtSchemaOrg from '../../src/module'

it('loads site config when Schema.org setup is disabled', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'schema-org-dependencies-'))
  try {
    await symlink(fileURLToPath(new URL('../../node_modules', import.meta.url)), join(cwd, 'node_modules'), 'dir')
    const nuxt = await loadNuxt({
      cwd,
      overrides: {
        dev: false,
        devtools: false,
        modules: [NuxtSchemaOrg],
        site: { url: 'https://nuxtseo.com', name: 'Nuxt SEO' },
        schemaOrg: { enabled: false },
      },
    })
    try {
      const config = nuxt.options.runtimeConfig['nuxt-site-config'] as { stack: { url?: string, name?: string }[] }
      expect(config.stack).toContainEqual(expect.objectContaining({ url: 'https://nuxtseo.com', name: 'Nuxt SEO' }))
    }
    finally {
      await nuxt.close()
    }
  }
  finally {
    await rm(cwd, { recursive: true })
  }
}, 30_000)
