import type { Component, Slots } from 'vue'
import { SchemaOrgArticle } from '@unhead/schema-org/vue'
import { createHead } from '@unhead/vue/server'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { defineSchemaOrgSlotComponent } from '../../src/runtime/app/utils/slot-component'

function render(component: Component, props: Record<string, unknown>, slots: Partial<Slots>) {
  const app = createSSRApp({ render: () => h(component, props, slots) })
  app.use(createHead())
  return renderToString(app)
}

describe('defineSchemaOrgSlotComponent', () => {
  const SlotArticle = defineSchemaOrgSlotComponent('SchemaOrgArticle')

  it('renders the same markup as the unhead component', async () => {
    const props = { 'as': 'article', 'headline': 'Hello', 'date-published': '2024-01-01', 'data-foo': 'bar', 'class': 'post' }
    const slots = {
      default: (data: Record<string, unknown>) => [h('pre', JSON.stringify(data))],
      author: () => [h('span', ' Harlan ')],
    }

    const html = await render(SlotArticle, props, slots)
    expect(html).toBe(await render(SchemaOrgArticle, props, slots))
    expect(html).toContain('<article')
    expect(html).toContain('Harlan')
  })

  it('renders nothing without a default slot', async () => {
    const props = { headline: 'Hello' }

    expect(await render(SlotArticle, props, {})).toBe(await render(SchemaOrgArticle, props, {}))
  })
})
