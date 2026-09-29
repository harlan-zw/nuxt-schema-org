---
name: nuxt-schema-org
description: Add, fix, or debug Schema.org JSON-LD in a Nuxt app with the nuxt-schema-org module. Use when a task mentions structured data, rich results, JSON-LD, site identity (Organization, Person, LocalBusiness), useSchemaOrg, defineArticle, defineProduct, defineBreadcrumb, FAQ markup, or the schemaOrg frontmatter key in Nuxt Content. Gives the setup, the default graph, verified recipes, and the traps that silently drop nodes.
---

# nuxt-schema-org

Nuxt module that renders one Schema.org `@graph` per page as `<script type="application/ld+json">`.
It wraps [Unhead Schema.org](https://unhead.unjs.io/docs/schema-org/guides/get-started/overview) and adds Nuxt defaults, site config, Nuxt Content, and i18n.

Written against `nuxt-schema-org` 6.4.0. Requires Nuxt `>=3.16.0` (`src/module.ts`). Docs: https://nuxtseo.com/docs/schema-org

## Setup

```bash
npx nuxi@latest module add schema-org
```

Set the site URL and name. Every `@id` and relative URL resolves against `site.url`.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-schema-org'],
  site: {
    url: 'https://example.com',
    name: 'Example',
    description: 'Site description.',
  },
})
```

The module needs SSR. Crawlers read the SSR response only. With `ssr: false` the module warns in dev.

## What you get for free

With `defaults: true` (the default) every page gets:

- `WebSite` from `site.name`, `site.description`, and the current locale.
- `WebPage` for the current URL. Its `name` comes from the page `<title>`.
- The identity node, if `schemaOrg.identity` is set. `WebSite.publisher` and `WebPage.about` point to it.

`WebPage` picks its subtype from the last path segment: `about`, `about-us` to `AboutPage`; `contact`, `contact-us`, `get-in-touch` to `ContactPage`; `faq` to `FAQPage`; `search` to `SearchResultsPage`; `checkout` to `CheckoutPage`.

Set `schemaOrg: { defaults: false }` to emit only the nodes you add.

## Site identity

Put a static identity in `nuxt.config.ts`. Use a plain object with `type`:

```ts
export default defineNuxtConfig({
  schemaOrg: {
    identity: {
      type: 'Organization', // 'Organization' | 'Person' | 'LocalBusiness'
      name: 'Acme',
      logo: '/logo.png', // resolves to https://example.com/logo.png
      sameAs: ['https://github.com/acme', 'https://x.com/acme'],
    },
  },
})
```

`defineOrganization`, `definePerson`, and `defineLocalBusiness` from `nuxt-schema-org/schema` also work here.

For a LocalBusiness subtype, keep `type: 'LocalBusiness'` and add `'@type'`:

```ts
identity: {
  'type': 'LocalBusiness',
  '@type': 'Restaurant', // any https://schema.org/LocalBusiness#subtypes
  'name': 'The Coastal Kitchen',
  'address': { streetAddress: '742 Oceanview Blvd', addressLocality: 'Santa Cruz', addressRegion: 'CA', postalCode: '95060', addressCountry: 'US' },
  'openingHoursSpecification': [{ dayOfWeek: ['Monday', 'Tuesday'], opens: '11:30', closes: '22:00' }],
}
```

Output `@type` is `["Organization", "LocalBusiness", "Restaurant"]`.

> [!WARNING]
> In 6.4.0, `defineLocalBusiness({ '@type': 'Restaurant', ... })` inside `nuxt.config.ts` loses the LocalBusiness resolver.
> The node renders as `["Organization", "Restaurant"]` and `openingHoursSpecification` is not normalized.
> Cause: an explicit `'@type'` stops `resolveSerializableIdentityConfig()` from setting `type` (`src/unhead-compat.ts`), so `maybeAddIdentitySchemaOrg()` falls back to `defineOrganization` (`src/runtime/app/utils/shared.ts`).
> Use the plain object form above.

String subtypes such as `'OnlineStore'` are not valid `type` values.
For an online store use `'@type': ['Organization', 'Store', 'OnlineStore']` with `type: 'Organization'`.

If identity depends on runtime data, call `useSchemaOrg([defineOrganization({...})])` in `app.vue`.
A `defineOrganization` or `definePerson` node in the graph becomes the `#identity` node.

## Add nodes on a page

`useSchemaOrg()` and every `defineX()` are auto-imported. Pass an array.

```vue
<script setup lang="ts">
const { data: product } = await useFetch('/api/product')

useSchemaOrg([
  defineProduct({
    name: product.value!.name,
    description: product.value!.description,
    image: product.value!.image, // relative paths resolve against site.url
    sku: product.value!.sku,
    offers: [{ price: product.value!.price, priceCurrency: 'USD', availability: 'InStock' }],
  }),
])
</script>
```

The resolver links nodes for you. `Product.brand`, `Article.publisher`, and `Article.author` fall back to `#identity`. `mainEntityOfPage` points to the page `WebPage`.
Enum values take the short form: `availability: 'InStock'` renders as `https://schema.org/InStock`.

Rules that matter:

- **Await data before `useSchemaOrg()`.** In production the graph renders once on the server. Data fetched in `onMounted` or after hydration never reaches crawlers.
- **Pass `description` yourself.** `WebPage` takes `name` from `<title>`. A page-level `useSeoMeta({ description })` does not reach `WebPage` or `Article`: they show `site.description`, or no description. Set `description` in `defineWebPage()` or `defineArticle()`.
- **Merge, do not duplicate.** Nodes with the same `@id` merge. `defineWebPage({ name: 'X' })` extends the default `WebPage`. It does not add a second one.
- **Refs and getters work.** Pass a `computed()` for the whole array or for single fields. See `src/runtime/app/composables/useSchemaOrg.ts`.

## Recipes

Article with author:

```ts
useSchemaOrg([
  defineArticle({
    headline: 'Hello post',
    description: 'A short summary.',
    image: '/og.png',
    datePublished: new Date(2026, 0, 5),
    author: { name: 'Jane Doe', url: 'https://example.com/jane' },
  }),
])
```

Breadcrumbs. The last item may omit `item`. Positions are added.

```ts
useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Docs', item: '/docs' },
      { name: 'Install' },
    ],
  }),
])
```

FAQ. Set the `WebPage` type, then add questions. They attach to `WebPage.mainEntity`.

```ts
useSchemaOrg([
  defineWebPage({ '@type': 'FAQPage' }),
  defineQuestion({ name: 'Do you ship abroad?', acceptedAnswer: 'Yes, to 30 countries.' }),
  defineQuestion({ name: 'Can I return an item?', acceptedAnswer: 'Yes, within 30 days.' }),
])
```

Custom node. Any plain object with `'@type'` works. Type it with [schema-dts](https://github.com/google/schema-dts) if you want.

```ts
useSchemaOrg([
  { '@type': 'DefinedTerm', 'name': 'Schema.org', 'inDefinedTermSet': { '@type': 'DefinedTermSet', 'name': 'SEO terms' } },
])
```

A node without `'@type'` is ignored by search engines. Since 6.4.0 the module warns in dev (`src/runtime/app/utils/untyped-nodes.ts`).
Do not pass a full JSON-LD document. Pass the items of its `@graph` array.

Components exist for templates, for example `<SchemaOrgWebSite name="..." />` and `<SchemaOrgArticle />`. Prefer `useSchemaOrg()` in script code.

## Available defineX functions

The module aliases `@unhead/schema-org` to the major that matches the app's unhead (`src/module.ts`, `src/unhead-compat.ts`).
Nuxt 4.5 ships unhead v3.
On unhead v2, these are missing: `defineDiscussionForumPosting`, `defineEmployerAggregateRating`, `defineMathSolver`, `defineQuiz`, `defineVacationRental`.
If one of those is undefined, check the app's `@unhead/vue` major.
Full node list: https://unhead.unjs.io/docs/schema-org/api/schema/organization

## Nuxt Content

Content v3: add `defineSchemaOrgSchema()` **and a `head` field** to the page collection schema.
Without `head`, the `schemaOrg` frontmatter key is parsed but never rendered.
(The docs page omits `head`. Verified against `test/fixtures/content-v3/content.config.ts`.)

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

Render the page head, or nothing appears:

```ts
const { data: page } = await useAsyncData(`page-${route.path}`, () => queryCollection('content').path(route.path).first())
useHead(page.value?.head || {})
```

Frontmatter takes an object (extends `WebPage`) or an array (adds nodes):

```md
---
schemaOrg:
  - "@type": "BlogPosting"
    headline: "How to use our product"
    datePublished: "2023-10-01"
---
```

Use exact schema.org type names. `FAQPage` is correct; `FaqPage` is not a schema.org type.

`asSchemaOrgCollection()` is deprecated. Replace it with `defineSchemaOrgSchema()`.
Content v2 and comark-content need no schema change. Guide: https://nuxtseo.com/docs/schema-org/guides/content

## i18n

With `@nuxtjs/i18n`, each locale gets its own `WebSite` node linked by `workTranslation`.
Per-locale `name` and `description` come from `nuxtSiteConfig.name` and `nuxtSiteConfig.description` in the locale messages.
The config identity is shared across locales. For translated identity fields, call `defineOrganization({ name: () => t('...') })` in `app.vue`.
Guide: https://nuxtseo.com/docs/schema-org/guides/i18n

## Config

| Option | Default | Effect |
| --- | --- | --- |
| `identity` | none | Site identity node. |
| `defaults` | `true` | Add `WebSite`, `WebPage`, and identity. |
| `reactive` | dev or `ssr: false` | Ship schema code to the client and update on navigation. SEO does not need it. |
| `minify` | `!dev` | Minify the JSON-LD. |
| `scriptAttributes` | `{ 'data-nuxt-schema-org': true }` | Attributes on the script tag. `false` for none. |
| `enabled` | `true` | Turn the module off. |
| `debug` | `false` | Debug logs and the debug route in production. |

Change the meta that feeds every node (for example `host`) with the `schema-org:meta` runtime hook in a Nuxt plugin.

## Debug

- Nuxt DevTools, Schema.org tab.
- `/__schema-org__/debug.json` in dev, or with `debug: true`.
- `curl` the page and read the `application/ld+json` script. Client-side inspection shows a dev-only reactive graph.
- Validate with https://search.google.com/test/rich-results or https://validator.schema.org/.
