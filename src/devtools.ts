import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { useNuxt } from '@nuxt/kit'
import { setupDevToolsUI as _setupDevToolsUI } from 'nuxtseo-shared/devtools'

export const DEVTOOLS_UI_LOCAL_PORT = 3030

export function setupDevToolsUI(_options: unknown, resolve: Resolver['resolve'], nuxt: Nuxt = useNuxt()): void {
  _setupDevToolsUI({
    route: '/__nuxt-schema-org',
    name: 'nuxt-schema-org',
    title: 'Schema.org',
    icon: 'carbon:chart-relationship',
  }, resolve, nuxt)
}
