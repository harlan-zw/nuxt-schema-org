<h1 align='center'>nuxt-schema-org</h1>

<p align="center">
<a href='https://github.com/harlan-zw/nuxt-schema-org/actions/workflows/test.yml'>
</a>
<a href="https://www.npmjs.com/package/nuxt-schema-org" target="__blank"><img src="https://img.shields.io/npm/v/nuxt-schema-org?style=flat&colorA=002438&colorB=28CF8D" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/nuxt-schema-org" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/nuxt-schema-org?flat&colorA=002438&colorB=28CF8D"></a>
<a href="https://github.com/harlan-zw/nuxt-schema-org" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/harlan-zw/nuxt-schema-org?flat&colorA=002438&colorB=28CF8D"></a>
</p>

<p align="center">
The quickest and easiest way to build Schema.org graphs for Nuxt. Powered by [Unhead](https://unhead.unjs.io).
</p>

<p align="center">
<table>
<tbody>
<td align="center">
<img width="800" height="0" /><br>
<i>Status:</i> <a href="https://github.com/harlan-zw/nuxt-schema-org/releases/tag/v3.0.0">v3 Released 🎉</a></b> <br>
<sup> Please report any issues 🐛</sup><br>
<sub>Made possible by my <a href="https://github.com/sponsors/harlan-zw">Sponsor Program 💖</a><br> Follow me <a href="https://twitter.com/harlan_zw">@harlan_zw</a> 🐦 • Join <a href="https://discord.gg/275MBUBvgP">Discord</a> for help</sub><br>
<img width="800" height="0" />
</td>
</tbody>
</table>
</p>

## Features

- 😎 Simple API based on [Google](https://developers.google.com/search/docs/advanced/structured-data/search-gallery) and [Yoast](https://developer.yoast.com/features/schema/overview) best practices
- 🧙 30+ Nodes with automated relations, date, URL resolving and more for best practice Schema.org
- 💡 Simple global meta provides for minimal boilerplate
- 🌳 Minimal code, optimised for tree-shaking and SSR
- Nuxt Dev Tools integration

## Installation

1. Install `nuxt-schema-org` dependency to your project:

```bash
#
yarn add -D nuxt-schema-org
#
npm install -D nuxt-schema-org
#
pnpm i -D nuxt-schema-org
```

2. Add it to your `modules` section in your `nuxt.config`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-schema-org']
})
```

# Documentation

[📖 Read the full documentation](https://nuxtseo.com/schema-org) for more information.

### Demos

- [Nuxt Schema.org - StackBlitz](https://stackblitz.com/edit/nuxt-starter-z9np1t?file=package.json)

## Sponsors

<p align="center">
  <a href="https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg">
    <img src='https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg'/>
  </a>
</p>

## License

MIT License © 2022-PRESENT [Harlan Wilton](https://github.com/harlan-zw)
