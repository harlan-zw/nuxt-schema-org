import { startSubprocess } from '@nuxt/devtools-kit'
import { createResolver, defineNuxtModule } from '@nuxt/kit'

const resolver = createResolver(import.meta.url)

export default defineNuxtModule((_, nuxt) => {
  if (!nuxt.options.dev || !nuxt.options.modules?.includes('@nuxt/scripts'))
    return

  startSubprocess(
    {
      command: 'npx',
      args: ['nuxi', 'dev', '--port', '3030'],
      cwd: resolver.resolve('.'),
    },
    {
      id: 'nuxt-devtools:scripts-client',
      name: 'Nuxt DevTools Scripts Client',
    },
  )
})
