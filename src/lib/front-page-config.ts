import { z } from 'astro/zod'

export const FRONT_PAGE_PLUGIN_ID = 'front-page-config'
export const FRONT_PAGE_CONFIG_KEY = `plugin:${FRONT_PAGE_PLUGIN_ID}:settings:homepage`

export type FrontPageConfig = {
  heroCommand: string
  heroCommandFlag: string
  heroName: string
  heroLocation: string
  heroInterests: string
  projectsTitle: string
  starredTitle: string
  experienceTitle: string
  contactTitle: string
  showProjects: boolean
  showStarred: boolean
  showExperience: boolean
  showContact: boolean
}

export const frontPageConfigSchema = z.object({
  heroCommand: z.string().min(1).max(120),
  heroCommandFlag: z.string().min(1).max(120),
  heroName: z.string().min(1).max(120),
  heroLocation: z.string().min(1).max(120),
  heroInterests: z.string().min(1).max(500),
  projectsTitle: z.string().min(1).max(120),
  starredTitle: z.string().min(1).max(120),
  experienceTitle: z.string().min(1).max(120),
  contactTitle: z.string().min(1).max(120),
  showProjects: z.boolean(),
  showStarred: z.boolean(),
  showExperience: z.boolean(),
  showContact: z.boolean(),
})

export const frontPageConfigUpdateSchema = frontPageConfigSchema.partial()

export async function getFrontPageConfig(db?: {
  selectFrom: (...args: any[]) => any
} | null) {
  if (!db) {
    throw new Error('Front page config is unavailable because the EmDash database is missing.')
  }

  try {
    const row = await db
      .selectFrom('options')
      .select('value')
      .where('name', '=', FRONT_PAGE_CONFIG_KEY)
      .executeTakeFirst()

    if (!row?.value || typeof row.value !== 'string') {
      throw new Error('Front page config is missing. Insert it in EmDash before rendering /.')
    }

    const parsed = frontPageConfigSchema.safeParse(JSON.parse(row.value))

    if (!parsed.success) {
      throw new Error('Front page config is invalid in EmDash.')
    }

    return parsed.data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error('Failed to load front page config from EmDash.')
  }
}
