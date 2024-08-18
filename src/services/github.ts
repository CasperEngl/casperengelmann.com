import { GITHUB_API_KEY } from 'astro:env/server'
import { z } from 'zod'

export const githubHeaders = new Headers({
  Authorization: `token ${GITHUB_API_KEY}`,
  'User-Agent': 'Casper-Engeln',
})

export const repoSchema = z.object({
  html_url: z.string(),
  full_name: z.string(),
  private: z.boolean().optional(),
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

  return filteredRepos
}
