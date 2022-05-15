import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel/static'

import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import partytown from '@astrojs/partytown'

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  integrations: [react(), tailwind(), partytown()],
})
