import type { ModuleOptions } from '../module'

export type ModuleRuntimeConfig = Pick<ModuleOptions, 'scriptAttributes' | 'reactive' | 'minify' | 'identity'> & { version: string }

