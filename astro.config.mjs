import cloudflare from '@astrojs/cloudflare'
import mdx from '@astrojs/mdx'
import tailwind from '@astrojs/tailwind'
import { defineConfig, envField } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  experimental: {
    env: {
      schema: {
        GITHUB_API_KEY: envField.string({
          access: 'secret',
          context: 'server',
        }),
      },
    },
    serverIslands: true,
  },
  integrations: [tailwind(), mdx()],
  output: 'hybrid',
  site: 'https://casperengelmann.com',
})
