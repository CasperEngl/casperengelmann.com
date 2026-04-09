import { Schema } from 'effect'
import { z } from 'astro/zod'
import { getDb } from './db'

export const FRONT_PAGE_PLUGIN_ID = 'front-page-config'
export const FRONT_PAGE_CONFIG_KEY = `plugin:${FRONT_PAGE_PLUGIN_ID}:settings:homepage`

const boundedString = (max: number) => Schema.String.pipe(Schema.maxLength(max))

const defaultString = (max: number) =>
  Schema.optionalWith(boundedString(max), {
    default: () => '',
    exact: true,
  })

const defaultBoolean = (value: boolean) =>
  Schema.optionalWith(Schema.Boolean, {
    default: () => value,
    exact: true,
  })

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

const decodeFrontPageConfig = Schema.decodeUnknownSync(frontPageConfigEffectSchema)
const decodeFrontPageConfigJson = Schema.decodeUnknownSync(
  Schema.parseJson(frontPageConfigEffectSchema),
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

export async function getFrontPageConfig() {
  const db = await getDb()

  try {
    const row = await db
      .selectFrom('options')
      .select('value')
      .where('name', '=', FRONT_PAGE_CONFIG_KEY)
      .executeTakeFirst()

    if (!row?.value || typeof row.value !== 'string') {
      return defaultFrontPageConfig
    }

    return parseFrontPageConfigJson(row.value)
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error('Failed to load front page config from EmDash.')
  }
}
