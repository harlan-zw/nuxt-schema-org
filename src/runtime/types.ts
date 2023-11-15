import type { ModuleOptions } from '../module'

export type ModuleRuntimeConfig = Pick<ModuleOptions, 'reactive' | 'minify'> & { version: string }
