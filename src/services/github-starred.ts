import { Octokit } from '@octokit/core'

const octokit = new Octokit({ auth: import.meta.env.GITHUB_ACCESS_TOKEN })

export async function getStarredRepos() {
  const response = await octokit.request('GET /user/starred')

  return response.data
}
