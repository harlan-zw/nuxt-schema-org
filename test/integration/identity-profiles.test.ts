import { resolve } from 'node:path'
import { setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { $fetchSchemaOrg } from './utils'

const github = 'https://github.com/harlan-zw'
const linkedin = 'https://www.linkedin.com/company/example/'
const twitter = 'https://twitter.com/example'

describe.each([
  {
    name: 'configured array',
    sameAs: [github, linkedin],
    handle: '@example',
    expected: [github, linkedin, twitter],
  },
  {
    name: 'configured scalar',
    sameAs: github,
    handle: 'example',
    expected: [github, twitter],
  },
  {
    name: 'duplicate profiles',
    sameAs: [github, twitter, github],
    handle: '@example',
    expected: [github, twitter],
  },
  {
    name: 'missing profiles',
    sameAs: undefined,
    handle: '@example',
    expected: [twitter],
  },
  {
    name: 'empty profiles',
    sameAs: [],
    handle: '@example',
    expected: [twitter],
  },
])('$name with site.twitter', async ({ sameAs, handle, expected }) => {
  await setup({
    rootDir: resolve(import.meta.dirname, '../fixtures/config-identity'),
    dev: true,
    server: true,
    browser: false,
    nuxtConfig: {
      site: { twitter: handle },
      schemaOrg: {
        identity: { type: 'Organization', sameAs },
      },
    },
  })

  it('keeps configured profiles and adds the Twitter profile once', async () => {
    const schema = await $fetchSchemaOrg('/')
    const identity = schema['@graph'].find((node: any) => node['@id'] === 'https://nuxtseo.com/#identity')

    expect(identity.sameAs).toEqual(expected)
  })
})

describe('frozen site identity with site.twitter', async () => {
  await setup({
    rootDir: resolve(import.meta.dirname, '../fixtures/site-config-identity'),
    dev: true,
    server: true,
    browser: false,
    nuxtConfig: {
      site: { twitter: '@example' },
    },
  })

  it('keeps site identity profiles across requests', async () => {
    for (let request = 0; request < 2; request++) {
      const schema = await $fetchSchemaOrg('/')
      const identity = schema['@graph'].find((node: any) => node['@id'] === 'https://nuxtseo.com/#identity')

      expect(identity.sameAs).toEqual([github, twitter])
    }
  })
})
