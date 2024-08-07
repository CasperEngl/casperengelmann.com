import { defineCollection, z } from 'astro:content'

const experienceCollection = defineCollection({
  type: 'content',
  schema: z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    link: z.string().optional(),
  }),
})

export const collections = {
  experience: experienceCollection,
}
