import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const experienceCollection = defineCollection({
  type: 'content_layer',
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    link: z.string().optional(),
  }),
})

const blog = defineCollection({
  type: 'content_layer',
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
})

export const collections = {
  blog,
  experienceCollection,
}
