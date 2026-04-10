import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, envField } from 'astro/config'
import emdash, { local } from 'emdash/astro'
import { sqlite } from 'emdash/db'
import 'dotenv/config'
import { resendEmailPlugin } from './src/emdash/email/resend'
import { frontPagePlugin } from './src/emdash/front-page'

// https://astro.build/config
export default defineConfig({
  adapter: node({
    mode: 'standalone',
  }),
  site: 'https://casperengelmann.com',
  security: {
    allowedDomains: [
      {
        hostname: 'casperengelmanncom-production.up.railway.app',
        protocol: 'https',
      },
      {
        hostname: 'casperengelmann.com',
        protocol: 'https',
      },
      {
        hostname: 'www.casperengelmann.com',
        protocol: 'https',
      },
    ],
  },
  env: {
    schema: {
      GITHUB_API_KEY: envField.string({
        access: 'secret',
        context: 'server',
      }),
      RESEND_API_KEY: envField.string({
        access: 'secret',
        context: 'server',
      }),
      EMAIL_FROM: envField.string({
        access: 'secret',
        context: 'server',
      }),
      REDIS_URL: envField.string({
        access: 'secret',
        context: 'server',
      }),
    },
  },
  integrations: [
    mdx(),
    react(),
    emdash({
      database: sqlite({ url: 'file:./data/data.db' }),
      plugins: [frontPagePlugin(), resendEmailPlugin()],
      storage: local({
        directory: './data/uploads',
        baseUrl: '/_emdash/api/media/file',
      }),
    }),
  ],
  output: 'server',
  server: {
    host: process.env.HOST ?? '::',
    port: Number.parseInt(process.env.PORT ?? '3000', 10),
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
