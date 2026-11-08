import type { Nuxt } from '@nuxt/schema'
import { addTemplate, directoryToURL, tryResolveModule } from '@nuxt/kit'
import { renderedGraphScript } from './runtime/utils/graphScript'

type CompileResult = { _tag: 'Ok', tags: unknown } | { _tag: 'Bail', reason: string }

/** The Unhead compiler API the build needs, from `unhead/compiled`. */
export interface HeadCompiler {
  compileTags: (input: unknown, options?: { dynamicValues?: number }) => CompileResult
  dynamicValue: (index: number) => string
}

export type CompiledGraphSetup
  = | { _tag: 'Off' }
    | { _tag: 'On' }
    | { _tag: 'Unavailable', reason: string }

/** Whether the app turns on Unhead compiler mode: `unhead.vite.compile` in the Nuxt config. */
export function isCompilerMode(nuxt: Nuxt): boolean {
  const vite = (nuxt.options as { unhead?: { vite?: false | { compile?: unknown } } }).unhead?.vite
  return !!vite && !!vite.compile
}

/**
 * Compiles the graph script, with the graph as its one dynamic value. The server renders it with
 * the graph of each request, so the head keeps no render hook.
 */
export function compileGraphScript(compiler: HeadCompiler, scriptAttributes: Record<string, unknown> | false | undefined): CompileResult {
  return compiler.compileTags(renderedGraphScript(scriptAttributes, compiler.dynamicValue(0)), { dynamicValues: 1 })
}

/**
 * The `#schema-org/compiled-graph` module. `tags` is `null` when the graph renders through the
 * plugin. `attributes` are the script attributes the tags hold, as JSON: a runtime config
 * override of `scriptAttributes` keeps the plugin.
 */
export function compiledGraphModule(tags: unknown, attributes: Record<string, unknown> | false | undefined): string {
  return [
    `/** @type {import('unhead/compiled').CompiledTags | null} */`,
    `export const graphTags = ${JSON.stringify(tags ?? null)}`,
    `/** @type {string} */`,
    `export const graphAttributes = ${JSON.stringify(JSON.stringify(attributes ?? null))}`,
  ].join('\n')
}

async function compileGraph(nuxt: Nuxt, scriptAttributes: Record<string, unknown> | false | undefined): Promise<{ _tag: 'Ok', tags: unknown } | { _tag: 'Unavailable', reason: string }> {
  // The compiler must be the one of the Unhead that renders the app, so it resolves from the app.
  const compilerPath = await tryResolveModule('unhead/compiled', nuxt.options.modulesDir.map(dir => directoryToURL(dir)))
  // A dynamic import: an Unhead without the compiler must not break the module when compiler mode is off.
  const compiler = compilerPath
    ? await import(compilerPath) as Partial<HeadCompiler>
    : undefined
  if (typeof compiler?.compileTags !== 'function' || typeof compiler.dynamicValue !== 'function')
    return { _tag: 'Unavailable', reason: 'the installed Unhead has no compiler (compileTags in unhead/compiled)' }
  const result = compileGraphScript(compiler as HeadCompiler, scriptAttributes)
  return result._tag === 'Ok'
    ? result
    : { _tag: 'Unavailable', reason: `the graph script cannot compile: ${result.reason}` }
}

/**
 * Compiles the graph script for compiler mode and adds it as `#schema-org/compiled-graph`.
 * The server then renders the graph as a dynamic value of compiled tags. With compiler mode off,
 * with `reactive`, or with an Unhead that has no compiler, the module exports `graphTags = null`
 * and the Unhead Schema.org plugin renders the graph as before.
 */
export async function setupCompiledGraph(nuxt: Nuxt, options: { reactive: boolean, scriptAttributes: Record<string, unknown> | false | undefined }): Promise<CompiledGraphSetup> {
  // A reactive graph updates on the client, which only the plugin does.
  const compiled = isCompilerMode(nuxt) && !options.reactive
    ? await compileGraph(nuxt, options.scriptAttributes)
    : undefined
  const tags = compiled?._tag === 'Ok'
    ? compiled.tags
    : null
  const template = addTemplate({
    filename: 'schema-org/compiled-graph.mjs',
    write: true,
    getContents: () => compiledGraphModule(tags, options.scriptAttributes),
  })
  nuxt.options.alias['#schema-org/compiled-graph'] = template.dst
  if (!compiled)
    return { _tag: 'Off' }
  return compiled._tag === 'Ok'
    ? { _tag: 'On' }
    : compiled
}
