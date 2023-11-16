<script lang="ts" setup>
import { defineJobPosting, useSchemaOrg } from '#imports'

useSchemaOrg([
  {
    '@type': 'DefinedTerm',
    'name': 'Nuxt Schema.org',
    'description': 'Nuxt Schema.org is a Nuxt module for adding Schema.org to your Nuxt app.',
    'inDefinedTermSet': {
      '@type': 'DefinedTermSet',
      'name': 'Nuxt Modules',
    },
  },
  defineJobPosting({
    title: 'Software Engineer',
    description: 'We are looking for a Software Engineer to join our team to help us build Unhead.',
    hiringOrganization: {
      name: 'Unhead',
    },
    jobLocation: {
      address: {
        streetAddress: '1600 Amphitheatre Pkwy',
        addressLocality: 'Mountain View',
        addressRegion: 'CA',
        postalCode: '94043',
        addressCountry: 'US',
      },
    },
    baseSalary: {
      currency: 'USD',
      value: {
        value: 100000,
        unitText: 'YEAR',
      },
    },
    employmentType: 'FULL_TIME',
    validThrough: '2022-02-01',
    datePosted: '2022-01-01',
  }),
])
</script>

<template>
  job posting
</template>
