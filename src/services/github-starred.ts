import ms from 'ms'
import { z } from 'zod'
import { upstashRequest } from '~/services/upstash'

const repoSchema = z.object({
  html_url: z.string(),
  full_name: z.string(),
  private: z.boolean().optional(),
})

const cacheResultSchema = z.object({
  expiresAt: z.string(),
  repos: z.array(repoSchema),
})

type CacheResult = z.infer<typeof cacheResultSchema>
type Repo = CacheResult['repos'][number]

function repoIsPrivate(repo: Repo): repo is Repo & { private: true } {
  return repo.private === true
}

export async function getStarredRepos() {
  const cache = await upstashRequest('/get/my-starred-repos')

  if (cache) {
    console.log('My starred repos: cache hit')

    const { repos } = cacheResultSchema.parse(JSON.parse(cache))

    return repos
  }

  console.log('My starred repos: cache miss')

  const response = await fetch(
    'https://api.github.com/users/casperengl/starred?per_page=10',
    {
      headers: {
        Authorization: `token ${import.meta.env.GITHUB_API_KEY}`,
      },
    }
  )

  const repos = z.array(repoSchema).parse(await response.json())
  const expires = ms('1 hour') / 1000 // ms to seconds
  const transformedRepos = repos
    .filter((repo) => !repoIsPrivate(repo))
    .map((repo) => ({
      html_url: repo.html_url,
      full_name: repo.full_name,
    }))

  const body: CacheResult = {
    expiresAt: new Date(Date.now() + ms('1 hour')).toUTCString(),
    repos: transformedRepos,
  }

  await upstashRequest(`/set/my-starred-repos?EX=${expires}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return body.repos
}
