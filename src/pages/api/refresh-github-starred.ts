import { getStarredRepos } from '~/services/github'

export async function get() {
  await getStarredRepos()

  return new Response('ok')
}
