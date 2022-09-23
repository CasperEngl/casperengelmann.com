export async function getStarredRepos() {
  const response = await fetch(
    'https://api.github.com/users/casperengl/starred'
  )
  const repos = await response.json()

  return repos
}
