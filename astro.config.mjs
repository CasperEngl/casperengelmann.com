import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel/edge'

import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import partytown from '@astrojs/partytown'

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  integrations: [react(), tailwind(), partytown()],
})
