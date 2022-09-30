import ms from 'ms'
import { upstashRequest } from '~/services/upstash'

interface Repo {
  html_url: string
  full_name: string
  private: boolean
}

type CacheResult = {
  expires: string
  repos: Repo[]
}

export async function getStarredRepos() {
  // if (import.meta.env.PROD) {
  const cache = await upstashRequest<CacheResult>('/get/my-starred-repos')

  if (cache) {
    console.log('My starred repos: cache hit')

    return cache.repos
  }

  console.log('My starred repos: cache miss')
  // }

  const response = await fetch(
    'https://api.github.com/users/casperengl/starred?per_page=10',
    {
      headers: {
        Authorization: `token ${import.meta.env.GITHUB_API_KEY}`,
      },
    }
  )

  const json: Awaited<Repo[]> = await response.json()
  const expires = ms('1 hour') / 1000 // ms to seconds

  await upstashRequest(`/set/my-starred-repos?EX=${expires}`, {
    method: 'POST',
    body: JSON.stringify({
      expiresAt: new Date(Date.now() + ms('1 hour')).toISOString(),
      repos: json.map((repo) => ({
        html_url: repo.html_url,
        full_name: repo.full_name,
        private: repo.private,
      })),
    }),
  })

  return json.filter((repo) => !repo.private)
}
