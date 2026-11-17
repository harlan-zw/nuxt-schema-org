import { useKV } from 'nitro/kv'
import { defineEventHandler } from 'nuxt/server'

export default defineEventHandler(async () => {
  const storage = useKV('schema-org-regression')
  await storage.setItem('page', { name: 'Stored page' })
  const page = await storage.getItem('page')
  await storage.removeItem('page')
  return page
})
