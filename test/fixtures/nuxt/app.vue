<script lang="ts" setup>
import { computed, definePerson, useSchemaOrg } from '#imports'

useSchemaOrg([
  definePerson({
    name: computed(() => {
      return 'Harlan'
    }),
    jobTitle: 'Software Engineer',
  }),
])
</script>

<template>
  <div>
    <SchemaOrgWebSite name="My Website" />
    <SchemaOrgWebPage />
    <NuxtPage />
  </div>
</template>
