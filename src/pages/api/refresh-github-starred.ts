import type { APIContext } from 'astro'
import ms from 'ms'
import { z } from 'zod'
import { setStarredRepos } from '~/services/github'
import { redis } from '~/services/redis'

export const githubHeaders = new Headers({
  Authorization: `token ${import.meta.env.GITHUB_API_KEY}`,
})

const repoSchema = z.object({
  html_url: z.string(),
  full_name: z.string(),
  private: z.boolean().optional(),
})

const cacheResultSchema = z.object({
  expiresAt: z.string(),
  repos: z.array(repoSchema),
})

export async function GET(context: APIContext) {
  const response = await fetch(
    'https://api.github.com/users/casperengl/starred?per_page=10',
    {
      headers: githubHeaders,
    },
  )

  const json = await response.json()

  const repos = z.array(repoSchema).safeParse(json)

  if (repos.success) {
    const transformedRepos = repos.data
      .filter((repo) => !repo.private)
      .map((repo) => ({
        html_url: repo.html_url,
        full_name: repo.full_name,
      }))

    const expires = ms('1 hour')
    const expiryDate = new Date(Date.now() + expires)
    const body: z.infer<typeof cacheResultSchema> = {
      expiresAt: new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'short',
        timeStyle: 'medium',
        timeZone: 'Europe/Copenhagen',
      }).format(expiryDate),
      repos: transformedRepos,
    }

    await redis.set('my-starred-repos', body, {
      ex: expires / 1000, // ms to seconds
    })

    return transformedRepos
  }

  console.error('Failed to parse repos', repos.error)

  return new Response('ok')
}
