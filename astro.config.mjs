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
  env: {
    schema: {
      GITHUB_API_KEY: envField.string({
        access: 'secret',
        context: 'server',
      }),
    },
  },
  integrations: [tailwind(), mdx()],
  output: 'static',
  server: {
    host: process.env.HOST,
    port: Number.parseInt(process.env.PORT) || 4321,
  },
})
