import ms from 'ms'
import { upstashRequest } from '~/services/upstash'

interface Repo {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  language: string
  private: boolean
}

type CacheResult = {
  expires: number
  repos: Repo[]
}

export async function getStarredRepos() {
  if (import.meta.env.PROD) {
    const cache = await upstashRequest<CacheResult>('/get/my-starred-repos')

    if (cache) {
      console.log('My starred repos: cache hit')

      return cache.repos
    }

    console.log('My starred repos: cache miss')
  }

  const response = await fetch(
    'https://api.github.com/users/casperengl/starred',
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
      repos: json,
    }),
  })

  return json.filter((repo) => !repo.private)
}

export const starredRepos = await getStarredRepos()
