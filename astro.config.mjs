import { defineConfig } from 'astro/config';
import adapter from '@astrojs/deno';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  adapter: adapter(),
  integrations: [react(), tailwind(), partytown()]
});