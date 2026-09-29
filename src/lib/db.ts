import { Context, Effect, Layer, Schema } from 'effect'

type EmDashRuntime = typeof import('emdash/runtime')
type EmDashDatabase = Awaited<ReturnType<EmDashRuntime['getDb']>>

class DatabaseConnectionError extends Schema.TaggedError<DatabaseConnectionError>()(
  'DatabaseConnectionError',
  { cause: Schema.Unknown },
) {}

export class Database extends Context.Service<Database, EmDashDatabase>()(
  'app/Database',
  {
    make: Effect.gen(function* () {
      const runtime = yield* Effect.promise(() => import('emdash/runtime'))
      return yield* Effect.tryPromise({
        try: () => runtime.getDb(),
        catch: (cause) => new DatabaseConnectionError({ cause }),
      })
    }),
  },
) {
  static readonly layer = Layer.effect(this)(this.make)
}
