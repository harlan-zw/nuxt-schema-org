import { createSchemaOrgGraph, defineLocalBusiness } from '@unhead/schema-org'
import { describe, expect, it } from 'vitest'
import { describeUntypedSchemaOrgNodes } from '../../src/runtime/app/utils/untyped-nodes'

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
})
