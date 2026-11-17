import type { ModuleOptions } from '../module'

export type ModuleRuntimeConfig = Pick<ModuleOptions, 'scriptAttributes' | 'reactive' | 'minify' | 'identity' | 'excludeWorkTranslationLocales'> & { version: string }

export interface UnheadAugmentation<T> {
  script: { nodes: T }
}
