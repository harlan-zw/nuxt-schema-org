import { safeParse } from 'valibot'
import { describe, expect, it } from 'vitest'
import { defineSchemaOrgSchema } from '../../src/content-valibot'

const node = {
  '@type': 'AboutPage',
  'author': { '@type': 'Person', 'name': 'Ari' },
}

describe('defineSchemaOrgSchema', () => {
  it.each([
    node,
    [node],
  ])('preserves Schema.org nodes in %j', (value) => {
    expect(safeParse(defineSchemaOrgSchema(), value)).toMatchObject({ success: true, output: value })
  })

  it('rejects a string', () => {
    expect(safeParse(defineSchemaOrgSchema(), 'AboutPage').success).toBe(false)
  })
})
