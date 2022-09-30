import mdx from '@astrojs/mdx'
import netlify from '@astrojs/netlify/edge-functions'
import solid from '@astrojs/solid-js'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify(),
  integrations: [tailwind(), solid(), mdx()],
})
