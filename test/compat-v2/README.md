# Unhead v2 compatibility fixture

The main test suite runs against the Unhead **v3** stack (the root pnpm workspace
pins `@unhead/vue`/`unhead` to v3 so Nuxt's renderer stays coherent). This fixture
guards the **v2** stack, which can't coexist in the same workspace because the
unhead major is global.

It is a standalone npm project (excluded from the pnpm workspace) that installs a
coherent v2 stack — Nuxt 4.2, `@unhead/vue@2`, `unhead@2`, `@unhead/schema-org@2` —
and links the local module via `file:../..`. The test asserts the module's
cross-major code paths resolve correctly on unhead v2 core: the feature-detected
plugin export, the `defineX` identity resolver, and the computed-ref node handling.

## Run

From the repo root:

```sh
pnpm test:compat-v2
```

`run.mjs` builds the module, packs it (so pnpm `catalog:` refs are resolved into
versions npm can install), copies this fixture into a temp directory **outside the
repo**, installs the isolated v2 stack there, and runs the test. The temp dir is
required: nested under the repo, the workspace's hoisted (v3) `node_modules` leaks
into Nuxt's module resolution and breaks the v2 build.

The manifest is committed as `package.template.json` rather than `package.json` so
the workspace's pnpm `catalog:` tooling leaves it alone.

To add it to CI, run `pnpm test:compat-v2` as a separate job (it needs its own
install, so keep it out of the main vitest run).
