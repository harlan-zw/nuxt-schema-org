import { hasProtocol, joinURL, withBase } from 'ufo'
import type {
  Arrayable,
  Id,
  SchemaOrgNodeDefinition,
  Thing,
  WithResolver,
} from '../types'

export const idReference = <T extends Thing>(node: T | string) => ({
  '@id': typeof node !== 'string' ? node['@id'] : node,
})

export const resolvableDateToDate = (val: Date | string) => {
  try {
    const date = val instanceof Date ? val : new Date(Date.parse(val))
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  }
  // not too fussed if it can't be resolved, this is on the user to validate
  catch (e) {}
  return typeof val === 'string' ? val : val.toString()
}

export const resolvableDateToIso = (val: Date | string | undefined) => {
  if (!val)
    return val
  try {
    if (val instanceof Date)
      return val.toISOString()
    else
      return new Date(Date.parse(val)).toISOString()
  }
  // not too fussed if it can't be resolved, this is on the user to validate
  catch (e) {}
  return typeof val === 'string' ? val : val.toString()
}

export const IdentityId = '#identity'

export const setIfEmpty = <T extends Thing>(node: T, field: keyof T, value: any) => {
  if (!node?.[field] && value)
    node[field] = value
}

export interface ResolverOptions {
  /**
   * Return single images as an object.
   */
  array?: boolean
  /**
   * Move added nodes to the root graph.
   */
  root?: boolean
  /**
   * Generates ids for nodes.
   */
  generateId?: boolean
  afterResolve?: (node: any) => void
}

export const asArray = (input: any) => Array.isArray(input) ? input : [input]

export const dedupeMerge = <T extends Thing>(node: T, field: keyof T, value: any) => {
  const dedupeMerge: any[] = []
  const input = asArray(node[field])
  dedupeMerge.push(...input)
  const data = new Set(dedupeMerge)
  data.add(value)
  // @ts-expect-error untyped key
  node[field] = [...data.values()].filter(Boolean)
}

export const prefixId = (url: string, id: Id | string) => {
  // already prefixed
  if (hasProtocol(id))
    return url as Id
  if (!id.startsWith('#'))
    id = `#${id}`
  return joinURL(url, id) as Id
}

export const trimLength = (val: string | undefined, length: number) => {
  if (!val)
    return val

  if (val.length > length) {
    const trimmedString = val.substring(0, length)
    return trimmedString.substring(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(' ')))
  }
  return val
}

export const resolveDefaultType = (node: Thing, defaultType: Arrayable<string>) => {
  const val = node['@type']
  if (val === defaultType)
    return
  const types = new Set<string>([
    ...asArray(defaultType),
    ...asArray(val),
  ])
  node['@type'] = types.size === 1 ? val : [...types.values()]
}

export const resolveWithBase = (base: string, urlOrPath: string) => {
  // can't apply base if there's a protocol
  if (!urlOrPath || hasProtocol(urlOrPath) || (!urlOrPath.startsWith('/') && !urlOrPath.startsWith('#')))
    return urlOrPath
  return withBase(urlOrPath, base)
}

export const resolveAsGraphKey = (key?: Id | string) => {
  if (!key)
    return key
  return key.substring(key.lastIndexOf('#')) as Id
}

/**
 * Removes attributes which have a null or undefined value
 */
export const stripEmptyProperties = (obj: any) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] && typeof obj[k] === 'object') {
      // avoid walking vue reactivity
      if (obj[k].__v_isReadonly || obj[k].__v_isRef)
        return
      stripEmptyProperties(obj[k])
      return
    }
    if (obj[k] === '' || obj[k] === null || typeof obj[k] === 'undefined')
      delete obj[k]
  })
  return obj
}

export const provideResolver = <T>(input?: T, resolver?: SchemaOrgNodeDefinition<T>) => {
  return <WithResolver<T>> {
    ...(input || {}),
    _resolver: resolver,
  }
}

export function hashCode(s: string) {
  let h = 9
  for (let i = 0; i < s.length;)
    h = Math.imul(h ^ s.charCodeAt(i++), 9 ** 9)
  return ((h ^ h >>> 9) + 0x10000)
    .toString(16)
    .substring(1, 8)
    .toLowerCase()
}
