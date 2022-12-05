<h1 align='center'>schema-org-graph-js</h1>

<p align="center">
<a href='https://github.com/harlan-zw/schema-org-graph-js/actions/workflows/test.yml'>
<img src='https://github.com/harlan-zw/schema-org-graph-js/actions/workflows/test.yml/badge.svg' >
</a>
<a href="https://www.npmjs.com/package/schema-org-graph-js" target="__blank"><img src="https://img.shields.io/npm/v/schema-org-graph-js?color=2B90B6&label=" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/schema-org-graph-js" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/schema-org-graph-js?color=349dbe&label="></a>
<br>
<a href="https://github.com/harlan-zw/schema-org-graph-js" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/harlan-zw/schema-org-graph-js?style=social"></a>
</p>

<p align="center">
The quickest and easiest way to build Schema.org graphs for JavaScript Runtimes (Browser, Node, etc).
</p>

<p align="center">
<table>
<tbody>
<td align="center">
<img width="2000" height="0" /><br>
<i>Status:</i> <b>🔨 In Development</b> <br>
<sup> Please report any issues 🐛</sup><br>
<sub>Made possible by my <a href="https://github.com/sponsors/harlan-zw">Sponsor Program 💖</a><br> Follow me <a href="https://twitter.com/harlan_zw">@harlan_zw</a> 🐦</sub><br>
<img width="2000" height="0" />
</td>
</tbody>
</table>
</p>

## Background

This package provides a JS low-level API that frameworks can build their Schema.org implementations from, without any specific
JS runtimes requirements.

It was built for [@vueuse/schema-org](https://github.com/vueuse/schema-org).

## Features

- 😎 Choose your own provider: Simple ([Google](https://developers.google.com/search/docs/advanced/structured-data/search-gallery) and [Yoast](https://developer.yoast.com/features/schema/overview) best practices) and Full ([schema-dts](https://github.com/google/schema-dts))
- 🧙 30+ Nodes with automated relations, date, URL resolving and more for best practice Schema.org
- 💡 Simple global meta provides for minimal boilerplate
- 🌳 Minimal code, optimised for tree-shaking and SSR

## Install

```bash
npm add -D schema-org-graph-js
```

For temporary documentation you can visit [vue-schema-org.netlify.app](https://vue-schema-org.netlify.app/), proper documentation
will come soon.

## Setup Example

```ts
import { createSchemaOrgGraph, renderCtxToSchemaOrgJson } from 'schema-org-graph-js'
import { defineWebPage, defineWebSite, defineOrganization } from 'schema-org-graph-js/simple'

const ctx = createSchemaOrgGraph()

ctx.addNode([
  useSchemaOrg([
    defineOrganization({
      name: 'Nuxt.js',
      logo: '/logo.png',
      sameAs: [
        'https://twitter.com/nuxt_js'
      ]
    }),
    defineWebSite({
      name: 'Nuxt',
    }),
    defineWebPage(),
  ])
])

const schemaJson = renderCtxToSchemaOrgJson(ctx, {
  host: 'https://v3.nuxtjs.org/',
  path: '/getting-started/quick-start',
  title: 'Nuxt 3 - Quick Start',
  description: 'Starting fresh? Getting started with Nuxt 3 is straightforward!', 
})
```

### Output

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://v3.nuxtjs.org/#identity",
      "url": "https://v3.nuxtjs.org/getting-started/quick-start",
      "name": "Nuxt.js",
      "logo": {
        "@type": "ImageObject",
        "inLanguage": "en",
        "@id": "https://v3.nuxtjs.org/#logo",
        "url": "https://v3.nuxtjs.org/logo.png",
        "caption": "Nuxt.js",
        "contentUrl": "https://v3.nuxtjs.org/logo.png"
      },
      "sameAs": [
        "https://twitter.com/nuxt_js"
      ],
      "image": {
        "@id": "https://v3.nuxtjs.org/#logo"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://v3.nuxtjs.org/getting-started/quick-start#webpage",
      "url": "https://v3.nuxtjs.org/getting-started/quick-start",
      "title": "Nuxt 3 - Quick Start",
      "description": "Starting fresh? Getting started with Nuxt 3 is straightforward!",
      "potentialAction": [
        {
          "@type": "ReadAction",
          "target": [
            "https://v3.nuxtjs.org/"
          ]
        }
      ],
      "about": {
        "@id": "https://v3.nuxtjs.org/#identity"
      },
      "primaryImageOfPage": {
        "@id": "https://v3.nuxtjs.org/#logo"
      },
      "isPartOf": {
        "@id": "https://v3.nuxtjs.org/#website"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://v3.nuxtjs.org/#website",
      "url": "https://v3.nuxtjs.org/",
      "inLanguage": "en",
      "name": "Nuxt",
      "publisher": {
        "@id": "https://v3.nuxtjs.org/#identity"
      }
    }
  ]
}
```


## Sponsors

<p align="center">
  <a href="https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg">
    <img src='https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg'/>
  </a>
</p>


## License

MIT License © 2022-PRESENT [Harlan Wilton](https://github.com/harlan-zw)
