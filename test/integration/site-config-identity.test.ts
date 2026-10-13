import { resolve } from 'node:path'
import { setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { $fetchSchemaOrg } from './utils'

await setup({
  rootDir: resolve(import.meta.dirname, '../fixtures/site-config-identity'),
  server: true,
  browser: false,
})

describe('site config identity object', () => {
  it('renders an object identity from the frozen site config', async () => {
    const schema = await $fetchSchemaOrg('/')
    const identity = schema['@graph'].find((node: any) => node['@id'] === 'https://nuxtseo.com/#identity')

    expect(identity).toEqual({
      '@id': 'https://nuxtseo.com/#identity',
      '@type': 'Organization',
      'name': 'Nuxt SEO',
      'url': 'https://nuxtseo.com',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '1 Main Street',
        'addressCountry': 'AU',
      },
      'sameAs': ['https://github.com/harlan-zw'],
    })
  })
})
