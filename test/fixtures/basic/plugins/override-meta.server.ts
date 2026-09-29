import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks.hook('schema-org:meta', (meta) => {
    if (nuxtApp._route.path === '/plugin-override') {
      meta.host = 'https://override-example.com'
      meta.url = `${meta.host}${meta.path}`
    }
  })
  // only `url` changes; it must beat the page's canonical link
  nuxtApp.hooks.hook('schema-org:meta', (meta) => {
    if (nuxtApp._route.path === '/plugin-override-canonical')
      meta.url = 'https://override-example.com/custom-path'
  })
  // an async hook must finish before the graph resolves
  nuxtApp.hooks.hook('schema-org:meta', async (meta) => {
    if (nuxtApp._route.path === '/plugin-override-async') {
      await new Promise(resolve => setTimeout(resolve, 10))
      meta.host = 'https://async-override-example.com'
      meta.url = `${meta.host}${meta.path}`
    }
  })
})
