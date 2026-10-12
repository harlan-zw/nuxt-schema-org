import type { Nuxt } from '@nuxt/schema'
import { cp, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineNuxtModule, loadNuxt } from '@nuxt/kit'
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

async function copySiteConfig(cwd: string, name: string, version: string) {
  const source = await realpath(dirname(dirname(fileURLToPath(import.meta.resolve('nuxt-site-config')))))
  const destination = join(cwd, name)
  await mkdir(destination, { recursive: true })
  await cp(join(source, 'dist'), join(destination, 'dist'), { recursive: true })
  const pkg = JSON.parse(await readFile(join(source, 'package.json'), 'utf8'))
  await writeFile(join(destination, 'package.json'), JSON.stringify({ ...pkg, version }))
  await symlink(dirname(source), join(destination, 'node_modules'), 'dir')
  return join(destination, 'dist/module.mjs')
}

async function siteConfigConsumer(path: string, name: string) {
  const dependencies = await NuxtSchemaOrg.getModuleDependencies!({} as Nuxt)
  const requirement = dependencies[fileURLToPath(import.meta.resolve('nuxt-site-config'))]
  return defineNuxtModule({
    meta: { name },
    moduleDependencies: { [path]: requirement },
  })
}

it.each([false, true])('runs Site Config setup once across physical copies, explicit app copy: %s', async (explicit) => {
  const cwd = await mkdtemp(join(tmpdir(), 'schema-org-duplicate-dependencies-'))
  let nuxt: Nuxt | undefined
  let resolutions = 0
  try {
    await symlink(fileURLToPath(new URL('../../node_modules', import.meta.url)), join(cwd, 'node_modules'), 'dir')
    const first = await copySiteConfig(cwd, 'first', '5.0.0')
    const second = await copySiteConfig(cwd, 'second', '5.1.0')
    nuxt = await loadNuxt({
      cwd,
      overrides: {
        dev: false,
        devtools: false,
        site: { url: 'https://nuxtseo.com', name: 'Nuxt SEO' },
        hooks: { 'site-config:resolve': () => { resolutions++ } },
        modules: [
          explicit ? first : await siteConfigConsumer(first, 'first-consumer'),
          await siteConfigConsumer(second, 'second-consumer'),
        ],
      },
    })
    expect(resolutions).toBe(1)
    expect(nuxt.options.runtimeConfig['nuxt-site-config']).toMatchObject({ version: '5.0.0' })
  }
  finally {
    await nuxt?.close()
    await rm(cwd, { recursive: true })
  }
}, 30_000)

it('accepts newer Site Config majors through the compatibility range', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'schema-org-compatible-dependency-'))
  let nuxt: Nuxt | undefined
  try {
    await symlink(fileURLToPath(new URL('../../node_modules', import.meta.url)), join(cwd, 'node_modules'), 'dir')
    // Change package metadata to exercise Nuxt's range check with the real Site Config implementation.
    const path = await copySiteConfig(cwd, 'compatible', '6.0.0')
    nuxt = await loadNuxt({
      cwd,
      overrides: {
        dev: false,
        devtools: false,
        site: { url: 'https://nuxtseo.com', name: 'Nuxt SEO' },
        modules: [await siteConfigConsumer(path, 'compatible-consumer')],
      },
    })
    expect(nuxt.options.runtimeConfig['nuxt-site-config']).toMatchObject({
      version: '6.0.0',
      stack: expect.arrayContaining([expect.objectContaining({ url: 'https://nuxtseo.com', name: 'Nuxt SEO' })]),
    })
  }
  finally {
    await nuxt?.close()
    await rm(cwd, { recursive: true })
  }
}, 30_000)
