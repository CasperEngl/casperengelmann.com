import {
  getEmDashCollection,
  getEmDashEntry,
  getRequestContext,
  type CollectionFilter,
} from 'emdash'
import { Context, Effect, Layer } from 'effect'

async function getHomepageCollection<
  Collection extends 'experience' | 'projects',
>(collection: Collection, filter: CollectionFilter) {
  const result = await getEmDashCollection(collection, filter)
  const preview = getRequestContext()?.preview

  if (preview?.collection !== collection) return result

  const { entry } = await getEmDashEntry(collection, preview.id)
  if (!entry) return result

  const entries = [...result.entries]
  const existingIndex = entries.findIndex(
    (candidate) =>
      ('id' in candidate.data && candidate.data.id === preview.id) ||
      candidate.id === preview.id,
  )

  if (existingIndex === -1) entries.unshift(entry)
  else entries[existingIndex] = entry

  return { ...result, entries }
}

export class ContentCollections extends Context.Service<ContentCollections>()(
  'app/ContentCollections',
  {
    make: Effect.succeed({
      getExperience: Effect.fn('ContentCollections.getExperience')(() =>
        Effect.promise(() =>
          getHomepageCollection('experience', {
            status: 'published',
            orderBy: { start_date: 'desc' },
          }),
        ),
      ),
      getProjects: Effect.fn('ContentCollections.getProjects')(() =>
        Effect.promise(() =>
          getHomepageCollection('projects', {
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
