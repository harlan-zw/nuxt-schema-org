import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:net'

async function main() {
  const rootPackage = JSON.parse(await readFile(new URL('../../../package.json', import.meta.url), 'utf8'))
  const portServer = createServer()
  portServer.listen(0, '127.0.0.1')
  await once(portServer, 'listening')
  const port = portServer.address().port
  portServer.close()
  await once(portServer, 'close')

  const origin = `http://127.0.0.1:${port}`
  const nitroManifest = JSON.parse(await readFile(new URL('.output/nitro.json', import.meta.url), 'utf8'))
  assert.match(nitroManifest.versions.nitro, /^3\./)

  const server = spawn(process.execPath, ['.output/server/index.mjs'], {
    cwd: import.meta.dirname,
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: String(port),
    },
    stdio: 'inherit',
  })

  async function waitForServer() {
    for (let attempt = 0; attempt < 50; attempt++) {
      if (server.exitCode !== null)
        throw new Error(`Nuxt 5 server exited with code ${server.exitCode}`)
      const response = await fetch(`${origin}/__schema-org__/debug.json`, {
        signal: AbortSignal.timeout(1_000),
      }).catch((error) => {
        // Timeouts and refused connections are expected until the child server is ready.
        if (error instanceof TypeError || error?.name === 'TimeoutError')
          return null
        throw error
      })
      if (response?.ok)
        return response
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    throw new Error('Nuxt 5 server did not start')
  }

  try {
    const response = await waitForServer()
    const body = await response.json()
    assert.equal(body.siteConfig.url, 'https://schema-org.example.com')
    assert.equal(body.runtimeConfig.version, rootPackage.version)

    const page = await fetch(origin)
    assert.equal(page.status, 200)
    const html = await page.text()
    const jsonLd = html.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>([^<]*)<\/script>/)?.[1]
    assert.ok(jsonLd, 'The page must render a Schema.org script')
    const schema = JSON.parse(jsonLd)
    assert.equal(schema['@graph'].find(node => node['@type'] === 'WebSite')?.url, 'https://schema-org.example.com/')
  }
  finally {
    server.kill()
    if (server.exitCode === null)
      await once(server, 'exit')
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
