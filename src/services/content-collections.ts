import { getEmDashCollection } from 'emdash'
import { Context, Effect, Layer } from 'effect'

export class ContentCollections extends Context.Service<ContentCollections>()(
  'app/ContentCollections',
  {
    make: Effect.succeed({
      getExperience: Effect.fn('ContentCollections.getExperience')(() =>
        Effect.promise(() =>
          getEmDashCollection('experience', {
            status: 'published',
            orderBy: { start_date: 'desc' },
          }),
        ),
      ),
      getProjects: Effect.fn('ContentCollections.getProjects')(() =>
        Effect.promise(() =>
          getEmDashCollection('projects', {
            status: 'published',
            orderBy: { created_at: 'desc' },
          }),
        ),
      ),
    }),
  },
) {
  static readonly layer = Layer.effect(this)(this.make)
}
