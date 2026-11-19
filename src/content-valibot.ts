import * as v from 'valibot'

export function defineSchemaOrgSchema() {
  const node = v.record(v.string(), v.unknown())
  // Valibot also accepts arrays as records. Try the node array first.
  return v.optional(v.union([
    v.array(node),
    node,
  ]))
}
