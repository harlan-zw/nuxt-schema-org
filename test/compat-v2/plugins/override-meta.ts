import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks.hook('schema-org:meta', (meta) => {
    if (nuxtApp._route.path === '/plugin-override') {
      meta.host = 'https://override-example.com'
      meta.url = `${meta.host}${meta.path}`
    }
    // only `url` changes; it must beat the page's canonical link
    if (nuxtApp._route.path === '/plugin-override-canonical')
      meta.url = 'https://override-example.com/custom-path'
  })
})
