# Nuxt Content

Content v3: add `defineSchemaOrgSchema()` and a `head` field to the page collection schema.
Without `head`, the `schemaOrg` frontmatter key is parsed but never rendered.
The [Content guide](https://nuxtseo.com/docs/schema-org/guides/content) omits `head`.

```ts
// content.config.ts
import { defineCollection, defineContentConfig } from '@nuxt/content'
import { defineSchemaOrgSchema } from 'nuxt-schema-org/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        schemaOrg: defineSchemaOrgSchema(),
        head: z.object({
          meta: z.array(z.record(z.string(), z.any())).optional(),
          script: z.array(z.record(z.string(), z.any())).optional(),
        }).optional(),
      }),
    }),
  },
})
```

If Zod versions clash, pass your instance: `defineSchemaOrgSchema({ z })`.

Apply the page head in the catch-all page, or nothing renders:

```ts
const { data: page } = await useAsyncData(`page-${route.path}`, () => queryCollection('content').path(route.path).first())
useHead(page.value?.head || {})
```

Frontmatter takes an object, which extends `WebPage`, or an array, which adds nodes:

```md
---
schemaOrg:
  - "@type": "BlogPosting"
    headline: "How to use our product"
    datePublished: "2023-10-01"
---
```

`asSchemaOrgCollection()` is deprecated. Replace it with `defineSchemaOrgSchema()`.
Content v2 and comark-content need no schema change.
