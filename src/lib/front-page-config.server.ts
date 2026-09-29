import { Effect, Schema } from 'effect'
import { z } from 'astro/zod'
import { Database } from './db'

export const FRONT_PAGE_PLUGIN_ID = 'front-page-config'
export const FRONT_PAGE_CONFIG_KEY = `plugin:${FRONT_PAGE_PLUGIN_ID}:settings:homepage`

class FrontPageConfigError extends Schema.TaggedError<FrontPageConfigError>()(
  'FrontPageConfigError',
  {
    operation: Schema.String,
    cause: Schema.Unknown,
  },
) {}

const boundedString = (max: number) =>
  Schema.String.check(Schema.isMaxLength(max))

const defaultString = (max: number) =>
  boundedString(max).pipe(Schema.withDecodingDefaultTypeKey(Effect.succeed('')))

const defaultBoolean = (value: boolean) =>
  Schema.Boolean.pipe(Schema.withDecodingDefaultTypeKey(Effect.succeed(value)))

export const frontPageConfigEffectSchema = Schema.Struct({
  heroCommand: defaultString(120),
  heroCommandFlag: defaultString(120),
  heroName: defaultString(120),
  heroLocation: defaultString(120),
  heroInterests: defaultString(500),
  projectsTitle: defaultString(120),
  starredTitle: defaultString(120),
  experienceTitle: defaultString(120),
  contactTitle: defaultString(120),
  showProjects: defaultBoolean(true),
  showStarred: defaultBoolean(true),
  showExperience: defaultBoolean(true),
  showContact: defaultBoolean(true),
})

const decodeFrontPageConfig = Schema.decodeUnknownSync(
  frontPageConfigEffectSchema,
)
const decodeFrontPageConfigJson = Schema.decodeUnknownSync(
  Schema.fromJsonString(frontPageConfigEffectSchema),
)

export const defaultFrontPageConfig = decodeFrontPageConfig({})

export const frontPageConfigSchema = z.object({
  heroCommand: z.string().max(120),
  heroCommandFlag: z.string().max(120),
  heroName: z.string().max(120),
  heroLocation: z.string().max(120),
  heroInterests: z.string().max(500),
  projectsTitle: z.string().max(120),
  starredTitle: z.string().max(120),
  experienceTitle: z.string().max(120),
  contactTitle: z.string().max(120),
  showProjects: z.boolean(),
  showStarred: z.boolean(),
  showExperience: z.boolean(),
  showContact: z.boolean(),
})

export const frontPageConfigUpdateSchema = frontPageConfigSchema.partial()

export function normalizeFrontPageConfig(value: unknown) {
  return decodeFrontPageConfig(
    typeof value === 'object' && value !== null ? value : {},
  )
}

export function parseFrontPageConfigJson(value: string) {
  return decodeFrontPageConfigJson(value)
}

export const getFrontPageConfig = Effect.fn('getFrontPageConfig')(function* () {
  const db = yield* Database
  const row = yield* Effect.tryPromise({
    try: () =>
      db
        .selectFrom('options')
        .select('value')
        .where('name', '=', FRONT_PAGE_CONFIG_KEY)
        .executeTakeFirst(),
    catch: (cause) =>
      new FrontPageConfigError({
        operation: 'Load the front page configuration',
        cause,
      }),
  })

  if (!row?.value || typeof row.value !== 'string') {
    return defaultFrontPageConfig
  }

  return yield* Effect.try({
    try: () => parseFrontPageConfigJson(row.value),
    catch: (cause) =>
      new FrontPageConfigError({
        operation: 'Parse the front page configuration',
        cause,
      }),
  })
})
