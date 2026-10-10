---
name: nuxt-schema-org
description: Add, fix, or debug Schema.org JSON-LD in a Nuxt app with the nuxt-schema-org module. Use when a task mentions structured data, rich results, JSON-LD, site identity (Organization, Person, LocalBusiness), useSchemaOrg, defineArticle, defineProduct, defineBreadcrumb, FAQ markup, or the schemaOrg frontmatter key in Nuxt Content. Gives the default graph, verified examples, and the traps that silently drop or corrupt nodes.
license: MIT
compatibility: "Requires a project using nuxt-schema-org. Requires Node.js ^22.22.3 || ^24.15.0 || >=26.0.0. Requires Nuxt ^4.6.0 || ^5.0.0."
---

# nuxt-schema-org

Requires Nuxt `^4.6.0 || ^5.0.0` and Unhead 3.4.2 or newer.
The module renders one Schema.org `@graph` per page as `<script type="application/ld+json">`.
It wraps [Unhead Schema.org](https://unhead.unjs.io/docs/schema-org/guides/get-started/overview) and adds site config, Nuxt Content, and i18n. Docs: https://nuxtseo.com/docs/schema-org

## Setup

Set `site.url`. Every `@id` and relative URL resolves against it. `site.name` and `site.description` feed the `WebSite` node.
The module needs SSR. Crawlers read only the SSR response. With `ssr: false` the module warns in dev.

## Automatic behaviour

With `defaults: true` (the default), every page gets:

- `WebSite` from `site.name`, `site.description`, and the current locale.
- `WebPage` for the page canonical link, or the current URL without one. Its `name` comes from the page `<title>`.
- The identity node, if `schemaOrg.identity` is set. `WebSite.publisher` and `WebPage.about` point to it.

`WebPage` picks a subtype from the last path segment: `about`, `about-us` to `AboutPage`; `contact`, `contact-us`, `get-in-touch` to `ContactPage`; `faq` to `FAQPage`; `search` to `SearchResultsPage`; `checkout` to `CheckoutPage`.

The resolver links nodes. `Product.brand`, `Article.publisher`, and `Article.author` fall back to `#identity`. `mainEntityOfPage` points to the page `WebPage`.
Nodes with the same `@id` merge. `defineWebPage({ name: 'X' })` extends the default `WebPage`; it does not add a second one.
Enum values take the short form: `availability: 'InStock'` renders as `https://schema.org/InStock`.

Set `schemaOrg: { defaults: false }` to emit only the nodes you add.

## Site identity

Put a static identity in `nuxt.config.ts` as a plain object with `type` (`'Organization' | 'Person' | 'LocalBusiness'`).
For a LocalBusiness subtype, keep `type: 'LocalBusiness'` and add `'@type'`:

```ts
export default defineNuxtConfig({
  schemaOrg: {
    identity: {
      'type': 'LocalBusiness',
      '@type': 'Restaurant', // any https://schema.org/LocalBusiness#subtypes
      'name': 'The Coastal Kitchen',
      'address': { streetAddress: '742 Oceanview Blvd', addressLocality: 'Santa Cruz', addressCountry: 'US' },
      'openingHoursSpecification': [{ dayOfWeek: ['Monday', 'Tuesday'], opens: '11:30', closes: '22:00' }],
    },
  },
})
```

The identity `@type` renders as `["Organization", "LocalBusiness", "Restaurant"]`.

String subtypes such as `'OnlineStore'` are not valid `type` values.
For an online store, use `type: 'Organization'` with `'@type': ['Organization', 'Store', 'OnlineStore']`.

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
    offers: [{ price: product.value!.price, priceCurrency: 'USD', availability: 'InStock' }],
  }),
])
</script>
```

Await data before `useSchemaOrg()`. In production the graph renders once on the server. Data fetched in `onMounted` never reaches crawlers.
Refs, getters, and `computed()` work for the whole array or for single fields.

FAQ: set the `WebPage` type, then add questions. They attach to `WebPage.mainEntity`.

```ts
useSchemaOrg([
  defineWebPage({ '@type': 'FAQPage' }),
  defineQuestion({ name: 'Do you ship abroad?', acceptedAnswer: 'Yes, to 30 countries.' }),
])
```

Breadcrumbs: the last `itemListElement` may omit `item`. The resolver adds `position`.

Custom node: pass a plain object with `'@type'`. Pass the items of a `@graph` array, never a full JSON-LD document.

Components exist for templates, such as `<SchemaOrgArticle />`. Prefer `useSchemaOrg()` in script code.

## Nuxt Content and i18n

Nuxt Content v3 needs a schema change before the `schemaOrg` frontmatter key renders. See [references/nuxt-content.md](references/nuxt-content.md).

With `@nuxtjs/i18n`, each locale gets its own `WebSite` node linked by `workTranslation`.
Per-locale `name` and `description` come from `nuxtSiteConfig.name` and `nuxtSiteConfig.description` in the locale messages.
The config identity is shared across locales. For translated identity fields, call `defineOrganization({ name: () => t('...') })` in `app.vue`.

## Traps

- **`defineLocalBusiness({ '@type': 'Restaurant' })` as the config identity loses the LocalBusiness resolver.** It renders `["Organization", "Restaurant"]` and leaves `openingHoursSpecification` unnormalized. Use the plain object form above.
- **On unhead v2, a page `useSeoMeta({ description })` does not reach `WebPage` or `Article`.** They show `site.description`. Pass `description` to `defineWebPage()` or `defineArticle()`. On unhead v3, the page meta description reaches both nodes.
- **Type names are case sensitive.** `FAQPage` is valid. `FaqPage` renders as written and is not a schema.org type.
- **Content v3 without a `head` field in the collection schema drops the `schemaOrg` frontmatter.** No error, no node. See [references/nuxt-content.md](references/nuxt-content.md).
- **A node without `'@type'` still renders, and search engines ignore it.** The module warns in dev only.
- **A LocalBusiness identity with `logo` adds a second node, `#organization`.** The logo goes on that node, not on `#identity`. This is intentional upstream: unhead emits it for Google Logo rich results.

## Version limits

The module vendors Unhead Schema.org 3 and aliases `@unhead/schema-org` to that copy.
On unhead v2 these are undefined: `defineDiscussionForumPosting`, `defineEmployerAggregateRating`, `defineMathSolver`, `defineQuiz`, `defineVacationRental`.
Full node list: https://unhead.unjs.io/docs/schema-org/api/schema/organization

## Config

- `defaults` (`true`): add `WebSite`, `WebPage`, and identity.
- `reactive` (dev, or `ssr: false`): ship schema code to the client and update on navigation. SEO does not need it.
- Other options: https://nuxtseo.com/docs/schema-org/api/config

To change the meta that feeds every node, such as `host` or `url`, edit the object that the `schema-org:meta` hook receives in a Nuxt plugin. The hook may be async. A hook `url` sets `host` and `path` and wins over a canonical link.

## Debug

- `/__schema-org__/debug.json` in dev, or in production with `debug: true`.
- Nuxt DevTools has a Schema.org tab. In dev the client shows a reactive graph; crawlers see only the SSR script.
