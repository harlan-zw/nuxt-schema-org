import { computed } from 'vue'
import { useSchemaOrg } from '../../src/runtime/app/composables/useSchemaOrg'

useSchemaOrg(computed(() => [
  {
    '@type': 'Article' as const,
    'headline': 'Computed schema array',
  },
]))
