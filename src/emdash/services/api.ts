import { apiFetch, parseApiResponse } from 'emdash/plugin-utils'
import { Context, Effect, Layer, ManagedRuntime, Schema } from 'effect'

export class EmDashApiError extends Schema.TaggedError<EmDashApiError>()(
  'EmDashApiError',
  { message: Schema.String, cause: Schema.Unknown },
) {}

export class EmDashApi extends Context.Service<EmDashApi>()('app/EmDashApi', {
  make: Effect.succeed({
    request: Effect.fn('EmDashApi.request')(
      (endpoint: string, init?: RequestInit) =>
        Effect.tryPromise({
          try: () => apiFetch(endpoint, init),
          catch: (cause) =>
            new EmDashApiError({
              message: `Could not request ${endpoint}`,
              cause,
            }),
        }),
    ),
    parse: Effect.fn('EmDashApi.parse')(
      <A>(response: Response, message: string) =>
        Effect.tryPromise({
          try: () => parseApiResponse<A>(response, message),
          catch: (cause) => new EmDashApiError({ message, cause }),
        }),
    ),
  }),
}) {
  static readonly layer = Layer.effect(this)(this.make)
}

export const emDashApiRuntime = ManagedRuntime.make(EmDashApi.layer)
