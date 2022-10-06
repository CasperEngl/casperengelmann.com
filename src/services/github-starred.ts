import ms from 'ms'
import { upstashRequest } from '~/services/upstash'

interface Repo {
  html_url: string
  full_name: string
  private?: boolean
}

type CacheResult = {
  expiresAt: string
  repos: Repo[]
}

export async function getStarredRepos() {
  const cache = await upstashRequest('/get/my-starred-repos')

  if (cache) {
    console.log('My starred repos: cache hit')

    const json: CacheResult = JSON.parse(cache)

    return json.repos
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

  const json: Awaited<Repo[]> = await response.json()
  const expires = ms('1 hour') / 1000 // ms to seconds
  const repos: Repo[] = json
    .filter((repo) => !repo.private)
    .map((repo) => ({
      html_url: repo.html_url,
      full_name: repo.full_name,
    }))

  const body: CacheResult = {
    expiresAt: new Date(Date.now() + ms('1 hour')).toISOString(),
    repos,
  }

  await upstashRequest(`/set/my-starred-repos?EX=${expires}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return repos
}
