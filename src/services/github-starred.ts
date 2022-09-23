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

    if (cache?.expires > Date.now()) {
      console.log('Starred repos: cache hit')

      return cache.repos
    }

    console.log('Starred repos: cache miss')
  }

  const response = await fetch(
    'https://api.github.com/users/casperengl/starred',
    {
      headers: {
        Authorization: `token ${import.meta.env.GITHUB_API_KEY}`,
      },
    }
  )

  const json = (await response.json()) as Repo[]

  await upstashRequest('/set/my-starred-repos', {
    method: 'POST',
    body: JSON.stringify({
      expires: Date.now() + 1000 * 60 * 60, // 1 hour
      repos: json,
    }),
  })

  return json.filter((repo) => !repo.private)
}
