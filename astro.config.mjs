import cloudflare from '@astrojs/cloudflare'
import mdx from '@astrojs/mdx'
import tailwind from '@astrojs/tailwind'
import { defineConfig, envField } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [tailwind(), mdx()],
  experimental: {
    serverIslands: true,
    env: {
      schema: {
        GITHUB_API_KEY: envField.string({
          access: 'secret',
          context: 'server',
        }),
      },
    },
  },
})
