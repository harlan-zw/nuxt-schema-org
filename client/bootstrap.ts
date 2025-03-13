import { startSubprocess } from '@nuxt/devtools-kit'
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { DEVTOOLS_UI_LOCAL_PORT } from '../src/devtools'

const resolver = createResolver(import.meta.url)

export default defineNuxtModule((_, nuxt) => {
  if (!nuxt.options.dev || !nuxt.options.modules?.includes('@nuxt/scripts'))
    return

  startSubprocess(
    {
      command: 'npx',
      args: ['nuxi', 'dev', '--port', DEVTOOLS_UI_LOCAL_PORT.toString()],
      cwd: resolver.resolve('.'),
    },
    {
      id: 'nuxt-devtools:scripts-client',
      name: 'Nuxt DevTools Scripts Client',
    },
  )
})
