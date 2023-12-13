import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks.hook('schema-org:meta', (meta) => {
    meta.url = 'https://example.com'
  })
})
