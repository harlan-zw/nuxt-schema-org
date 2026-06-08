import { resolve } from 'node:path'
import { setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { $fetchSchemaOrg } from './utils'

await setup({
  rootDir: resolve(import.meta.dirname, '../fixtures/config-identity'),
  server: true,
  browser: false,
})

describe('config identity', () => {
  it('renders defineX identity config without resolver runtime config state', async () => {
    const schema = await $fetchSchemaOrg('/')
    const identity = schema['@graph'].find((node: any) => node['@id'] === 'https://nuxtseo.com/#identity')

    expect(identity).toMatchObject({
      '@type': 'Person',
      'name': 'Harlan',
      'jobTitle': 'Software Engineer',
    })
  })
})
