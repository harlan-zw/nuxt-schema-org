import type { VNode } from 'vue'
import { computed, defineComponent, h, unref } from 'vue'

const KEBAB_RE = /-./g

function fixKey(s: string) {
  let key = s.replace(KEBAB_RE, x => x[1]!.toUpperCase())
  if (key === 'type' || key === 'id')
    key = `@${key}`
  return key
}

function ignoreKey(s: string) {
  if (s.startsWith('aria-') || s.startsWith('data-'))
    return false
  return s === 'class' || s === 'style'
}

function shallowVNodesToText(nodes: VNode[]) {
  let text = ''
  for (const node of nodes) {
    if (typeof node.children === 'string')
      text += node.children.trim()
  }
  return text
}

/**
 * Creates a `<SchemaOrg*>` component that renders the same markup as the
 * `@unhead/schema-org/vue` component without registering a Schema.org node.
 */
export function defineSchemaOrgSlotComponent(name: string) {
  return defineComponent({
    name,
    props: {
      as: String,
    },
    setup(props, { slots, attrs }) {
      const nodePartial = computed(() => {
        const val: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(unref(attrs))) {
          if (!ignoreKey(key))
            val[fixKey(key)] = unref(value)
        }
        for (const [key, slot] of Object.entries(slots)) {
          if (!slot || key === 'default')
            continue
          val[fixKey(key)] = shallowVNodesToText(slot(props))
        }
        return val
      })
      return () => {
        if (!slots.default)
          return null
        return h(props.as || 'div', {}, [slots.default(unref(nodePartial))])
      }
    },
  })
}
