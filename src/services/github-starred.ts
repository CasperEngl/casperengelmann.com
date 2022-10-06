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
  const repos = json
    .filter((repo) => !repo.private)
    .map((repo) => ({
      html_url: repo.html_url,
      full_name: repo.full_name,
    }))

  const expires = ms('1 hour')
  const expiryDate = new Date(Date.now() + expires)
  const body: CacheResult = {
    expiresAt: new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'short',
      timeStyle: 'medium',
      timeZone: 'Europe/Copenhagen',
    }).format(expiryDate),
    repos,
  }

  await upstashRequest(`/set/my-starred-repos?EX=${expires / 1000}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return repos
}
