import cloudflare from '@astrojs/cloudflare'
import mdx from '@astrojs/mdx'
import solid from '@astrojs/solid-js'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [tailwind(), solid(), mdx()],
})
