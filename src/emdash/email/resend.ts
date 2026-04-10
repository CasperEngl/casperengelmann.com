import { fileURLToPath } from 'node:url'

import { definePlugin } from 'emdash'

const RESEND_EMAIL_PLUGIN_ID = 'resend-email'
const pluginVersion = '0.1.0'
const pluginEntrypoint = fileURLToPath(import.meta.url)
const RESEND_API_URL = 'https://api.resend.com/emails'

function getRequiredEnv(name: 'RESEND_API_KEY' | 'EMAIL_FROM') {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function resendEmailPlugin() {
  return {
    id: RESEND_EMAIL_PLUGIN_ID,
    version: pluginVersion,
    format: 'native',
    entrypoint: pluginEntrypoint,
    options: {},
  }
}

export function createPlugin() {
  return definePlugin({
    id: RESEND_EMAIL_PLUGIN_ID,
    version: pluginVersion,
    capabilities: ['email:provide', 'network:fetch:any'],
    hooks: {
      'email:deliver': async ({ message }) => {
        const apiKey = getRequiredEnv('RESEND_API_KEY')
        const from = getRequiredEnv('EMAIL_FROM')

        const response = await fetch(RESEND_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: [message.to],
            subject: message.subject,
            text: message.text,
            html: message.html,
          }),
        })

        if (!response.ok) {
          const details = await response.text()
          throw new Error(`Resend email delivery failed: ${details}`)
        }
      },
    },
  })
}

export default createPlugin
