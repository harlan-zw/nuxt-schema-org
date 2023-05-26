import { describe, it } from 'vitest'
import { createHead } from '@unhead/vue'
import { renderSSRHead } from '@unhead/ssr'
import { renderDOMHead } from '@unhead/dom'
import { ref } from 'vue'
import { useDom } from '../fixtures'
import { SchemaOrgUnheadPlugin, defineOrganization, defineWebPage, defineWebSite, useSchemaOrg } from '../../packages/vue/src'

describe('vue e2e', () => {
  it('ssr / csr hydration', async () => {
    // scenario: we are injecting root head schema which will not have a hydration step,
    // but we are also injecting a child head schema which will have a hydration step

    const ssrHead = createHead({
      plugins: [
        SchemaOrgUnheadPlugin({
          host: 'https://example.com',
        }, () => ({})),
      ],
    })

    const count = ref(0)

    // i.e App.vue
    useSchemaOrg([
      defineOrganization({
        name: 'My company',
        logo: '/logo.png',
      }),
      defineWebSite({
        name: 'My Awesome Website',
      }),
      defineWebPage({
        name: () => `Count is ${count.value}`,
      }),
    ])

    const data = await renderSSRHead(ssrHead)

    expect(data).toMatchInlineSnapshot(`
      {
        "bodyAttrs": "",
        "bodyTags": "",
        "bodyTagsOpen": "",
        "headTags": "",
        "htmlAttrs": "",
      }
    `)

    const dom = useDom(data)
    const csrHead = createHead({
      document: dom.window.document,
    })

    await renderDOMHead(csrHead, { document: dom.window.document })

    expect(dom.serialize()).toMatchInlineSnapshot(`
      "<!DOCTYPE html><html><head>

      </head>
      <body>

      <div>
      <h1>hello world</h1>
      </div>



      </body></html>"
    `)
  })
})
