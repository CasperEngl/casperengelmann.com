import { defineCollection, z } from 'astro:content'
import { glob } from 'glob'

const experienceCollection = defineCollection({
  type: 'content_layer',
  loader: glob(['src/content/experience/**/*.md']),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    link: z.string().optional(),
  }),
})

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
})

export const collections = {
  blog,
  experienceCollection,
}
