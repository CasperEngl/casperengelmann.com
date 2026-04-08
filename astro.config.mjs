import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import { defineConfig, envField } from 'astro/config'
import emdash, { local } from 'emdash/astro'
import { sqlite } from 'emdash/db'
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
  integrations: [
    tailwind(),
    mdx(),
    react(),
    emdash({
      database: sqlite({ url: 'file:./data/data.db' }),
      storage: local({
        directory: './data/uploads',
        baseUrl: '/_emdash/api/media/file',
      }),
    }),
  ],
  output: 'server',
  server: {
    host: process.env.HOST,
    port: Number.parseInt(process.env.PORT) || 3000,
  },
})
