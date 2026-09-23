import { createSchemaOrgGraph, defineLocalBusiness } from '@unhead/schema-org'
import { describe, expect, it, vi } from 'vitest'
import { describeUntypedSchemaOrgNodes, warnOnUntypedSchemaOrgNodes } from '../../src/runtime/app/utils/untyped-nodes'

const meta = { host: 'https://example.com', url: 'https://example.com/clinic', path: '/clinic' }

function render(nodes: Record<string, any>[]) {
  const graph = createSchemaOrgGraph()
  graph.push(nodes)
  return { '@context': 'https://schema.org', '@graph': graph.resolveGraph(meta) }
}

describe('describeUntypedSchemaOrgNodes', () => {
  it('names a raw node that has no @type', () => {
    // studiosmilecabinetdentaire.ch: a raw business object without "@type"
    const rendered = render([{
      name: 'Studio Smile',
      telephone: '+41225121208',
      address: { streetAddress: 'Chemin de la Chevillarde 43', addressCountry: 'CH' },
    }])

    expect(rendered['@graph'][0]['@id']).toBe('https://example.com/clinic#/schema//1')
    expect(describeUntypedSchemaOrgNodes(rendered)).toEqual([
      'Node "https://example.com/clinic#/schema//1" has no "@type", so search engines ignore it. Add "@type", or build it with a define function such as defineLocalBusiness().',
    ])
  })

  it('names a complete JSON-LD document passed as one node', () => {
    // theskinclub.nu: a whole { "@context", "@graph" } document passed to useSchemaOrg()
    const rendered = render([{
      '@context': 'https://schema.org',
      '@graph': [{ '@type': 'Organization', 'name': 'The Skin Club' }],
    }])

    expect(describeUntypedSchemaOrgNodes(rendered)).toEqual([
      'Node "https://example.com/clinic#/schema//1" holds a complete JSON-LD document ("@graph"). Pass the items of its "@graph" array to useSchemaOrg() instead.',
    ])
  })

  it('accepts typed raw nodes and define functions', () => {
    const rendered = render([
      { '@type': 'MedicalService', 'name': 'Pediatric Dentistry' },
      defineLocalBusiness({ name: 'Studio Smile', address: { streetAddress: 'Chemin de la Chevillarde 43', addressCountry: 'CH' } }),
    ])

    expect(describeUntypedSchemaOrgNodes(rendered)).toEqual([])
  })

  it('ignores input that is not a JSON-LD graph', () => {
    expect(describeUntypedSchemaOrgNodes(null)).toEqual([])
    expect(describeUntypedSchemaOrgNodes({ '@graph': 'x' })).toEqual([])
  })

  it('warns for a node whose @type is empty', () => {
    const rendered = {
      '@context': 'https://schema.org',
      '@graph': [{ '@type': [], 'name': 'Studio Smile' }, { '@type': '', 'name': 'Studio Smile Too' }],
    }

    expect(describeUntypedSchemaOrgNodes(rendered)).toEqual([
      'Node "(no @id)" has no "@type", so search engines ignore it. Add "@type", or build it with a define function such as defineLocalBusiness().',
      'Node "(no @id)" has no "@type", so search engines ignore it. Add "@type", or build it with a define function such as defineLocalBusiness().',
    ])
  })
})

describe('warnOnUntypedSchemaOrgNodes', () => {
  function createFakeHead(innerHTML: string) {
    let handler: ((context: { tags: { key: string, innerHTML: string }[] }) => void) | undefined
    return {
      head: { hooks: { hook: (name: string, fn: any) => { handler = fn } } },
      fire: () => handler?.({ tags: [{ key: 'schema-org-graph', innerHTML }] }),
    }
  }

  it('ignores an unparseable graph tag instead of throwing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { head, fire } = createFakeHead('not-json')

    expect(() => warnOnUntypedSchemaOrgNodes(head as any)).not.toThrow()
    expect(() => fire()).not.toThrow()
    expect(warnSpy).not.toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
