import type { ModuleOptions } from '../module'

export type ModuleRuntimeConfig = Pick<ModuleOptions, 'scriptAttributes' | 'reactive' | 'minify'> & { version: string }

export interface MetaInput {
  host?: string;
  url?: string;
  path?: string;
  currency?: string;
  image?: string;
  inLanguage?: string;
  title?: string;
  description?: string;
  datePublished?: Date | string;
  dateModified?: Date | string;
}
