import adapter from '@astrojs/deno'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: adapter(),
	integrations: [react(), tailwind()],
})
