import { fileURLToPath } from 'node:url'

import { Effect, Layer } from 'effect'
import { FetchHttpClient } from 'effect/http'
import { definePlugin } from 'emdash'

import { Resend } from '../../services/resend'

const RESEND_EMAIL_PLUGIN_ID = 'resend-email'
const pluginVersion = '0.1.0'
const pluginEntrypoint = fileURLToPath(import.meta.url)
const deliverEmail = Effect.fn('deliverEmail')(function* (message: {
  to: string
  subject: string
  text?: string
  html?: string
}) {
  const resend = yield* Resend
  return yield* resend.deliver(message)
})

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
    capabilities: [
      'hooks.email-transport:register',
      'network:request:unrestricted',
    ],
    hooks: {
      'email:deliver': {
        exclusive: true,
        handler: ({ message }) =>
          deliverEmail(message).pipe(
            Effect.provide(
              Resend.layer.pipe(Layer.provide(FetchHttpClient.layer)),
            ),
            Effect.runPromise,
          ),
      },
    },
  })
}

export default createPlugin
