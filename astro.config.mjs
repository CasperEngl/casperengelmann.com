import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import tailwind from '@astrojs/tailwind'
import { defineConfig, envField } from 'astro/config'
import 'dotenv/config'

// https://astro.build/config
export default defineConfig({
  adapter: node({
    mode: 'standalone',
  }),
  experimental: {
    contentLayer: true,
    contentIntellisense: true,
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
  server: {
    host: process.env.HOST,
    port: Number.parseInt(process.env.PORT) || 4321,
  },
})
