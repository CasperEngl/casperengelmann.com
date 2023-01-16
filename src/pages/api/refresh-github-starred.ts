import { setStarredRepos } from '~/services/github'

export async function get() {
  await setStarredRepos()

  return new Response('ok')
}
