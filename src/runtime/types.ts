import type { ModuleOptions } from '../module'

export type ModuleRuntimeConfig = Pick<ModuleOptions, 'scriptAttributes' | 'reactive' | 'minify' | 'identity'> & { version: string }

export interface UnheadAugmentation<T> {
  script: { nodes: T }
}
