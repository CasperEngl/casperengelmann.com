import adapter from '@astrojs/deno'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import solid from '@astrojs/solid-js'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: adapter(),
	integrations: [react(), tailwind(), solid(), mdx()],
})
