import type { ModuleOptions } from '../module'
import type { MetaInput } from '@unhead/schema-org'

export type ModuleRuntimeConfig = Pick<ModuleOptions, 'scriptAttributes' | 'reactive' | 'minify'> & { version: string }

export type { MetaInput }
