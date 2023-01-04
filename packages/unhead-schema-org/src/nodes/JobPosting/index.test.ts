import { expect } from 'vitest'
import { injectSchemaOrg, useSetup } from '../../../.test'
import { defineJobPosting, useSchemaOrg } from '../..'

describe('defineJobPosting', () => {
  it('can be registered', async () => {
    await useSetup(async () => {
      useSchemaOrg([
        defineJobPosting({
          datePosted: '2023-04-01',
          description: '<p>job description</p>',
          hiringOrganization: {
            name: 'Organization inc',

          },
          jobLocation: {
            address: 'Some postalcode',
            latitude: 50.1,
            longitude: 4.8,
          },
          title: 'Job posting title',
          employmentType: 'FULL_TIME',
          validThrough: '2023-05-01',
        }),
      ])

      const graphNodes = await injectSchemaOrg()

      expect(graphNodes).toMatchInlineSnapshot(`
        [
          {
            "@type": "JobPosting",
            "datePosted": "2023-3-1",
            "description": "<p>job description</p>",
            "employmentType": "FULL_TIME",
            "hiringOrganization": {
              "name": "Organization inc",
            },
            "jobLocation": {
              "address": "Some postalcode",
              "latitude": 50.1,
              "longitude": 4.8,
            },
            "title": "Job posting title",
            "validThrough": "2023-05-01",
          },
        ]
      `)
    })
  })
})