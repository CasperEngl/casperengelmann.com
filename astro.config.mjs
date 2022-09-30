import deno from '@astrojs/deno'
import mdx from '@astrojs/mdx'
import solid from '@astrojs/solid-js'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: deno(),
  integrations: [tailwind(), solid(), mdx()],
})
