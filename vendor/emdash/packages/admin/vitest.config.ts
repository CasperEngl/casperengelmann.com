import { getConfig } from '@lingui/conf'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vitest/config'

const linguiConfig = getConfig({
  configPath: fileURLToPath(new URL('./lingui.config.ts', import.meta.url)),
})

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['@lingui/babel-plugin-lingui-macro', { linguiConfig }]],
      },
    }) as Plugin[],
  ],
  test: {
    globals: true,
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
  },
})
