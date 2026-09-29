import { Config, Context, Effect, Layer, Schema } from 'effect'
import { HttpBody, HttpClient } from 'effect/http'

const RESEND_API_URL = 'https://api.resend.com/emails'

export class EmailDeliveryError extends Schema.TaggedError<EmailDeliveryError>()(
  'EmailDeliveryError',
  { message: Schema.String },
) {}

export class Resend extends Context.Service<Resend>()('app/Resend', {
  make: Effect.gen(function* () {
    const { apiKey, from } = yield* Config.all({
      apiKey: Config.String('RESEND_API_KEY'),
      from: Config.String('EMAIL_FROM'),
    })
    const client = yield* HttpClient.HttpClient

    const deliver = Effect.fn('Resend.deliver')(function* (message: {
      to: string
      subject: string
      text?: string
      html?: string
    }) {
      const body = yield* HttpBody.json({
        from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
      })
      const response = yield* client.post(RESEND_API_URL, {
        headers: { Authorization: `Bearer ${apiKey}` },
        body,
      })

      if (response.status < 200 || response.status >= 300) {
        const details = yield* response.text
        return yield* new EmailDeliveryError({
          message: `Resend email delivery failed: ${details}`,
        })
      }
    })

    return { deliver } as const
  }),
}) {
  static readonly layer = Layer.effect(this)(this.make)
}
