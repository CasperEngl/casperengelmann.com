import { GITHUB_API_KEY } from 'astro:env/server'
import ms from 'ms'
import { z } from 'zod'

export const githubHeaders = new Headers({
  Authorization: `token ${GITHUB_API_KEY}`,
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

export async function getStarredRepos() {
  const response = await fetch(
    'https://api.github.com/users/casperengl/starred?per_page=10',
    {
      headers: githubHeaders,
    },
  )

  const json = await response.json()

  const repos = z.array(repoSchema).parse(json)

  const filteredRepos = repos.filter((repo) => !repo.private)

  const expires = ms('1 hour')
  const expiryDate = new Date(Date.now() + expires)
  const body = {
    expiresAt: new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'short',
      timeStyle: 'medium',
      timeZone: 'Europe/Copenhagen',
    }).format(expiryDate),
    repos: filteredRepos,
  } satisfies z.infer<typeof cacheResultSchema>

  return body.repos
}
