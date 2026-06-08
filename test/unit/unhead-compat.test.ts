import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveHostUnheadMajor } from '../../src/unhead-compat'

function writePackage(root: string, id: string, version: string) {
  const packageDir = join(root, 'node_modules', ...id.split('/'))
  mkdirSync(packageDir, { recursive: true })
  writeFileSync(join(packageDir, 'index.js'), '')
  writeFileSync(join(packageDir, 'package.json'), JSON.stringify({ name: id, version, main: './index.js' }))
}

describe('resolveHostUnheadMajor', () => {
  it('prefers Nuxt Nitro server unhead over root-level unhead', async () => {
    const root = mkdtempSync(join(tmpdir(), 'nuxt-schema-org-unhead-'))

    writePackage(root, '@unhead/vue', '3.1.3')
    writePackage(root, 'unhead', '3.1.3')
    writePackage(root, 'nuxt', '4.4.7')
    writePackage(root, 'nuxt/node_modules/@unhead/vue', '2.1.15')
    writePackage(root, '@nuxt/nitro-server', '4.4.7')
    writePackage(root, '@nuxt/nitro-server/node_modules/@unhead/vue', '2.1.15')
    writePackage(root, '@nuxt/nitro-server/node_modules/unhead', '2.1.15')

    await expect(resolveHostUnheadMajor(root)).resolves.toBe(2)
  })
})
