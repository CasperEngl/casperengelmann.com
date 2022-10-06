export async function upstashRequest(
  path: string,
  init?: RequestInit
): Promise<string> {
  const request = new Request(
    `https://global-welcomed-stinkbug-31627.upstash.io${path}`,
    init
  )

  request.headers.set(
    'Authorization',
    `Bearer ${import.meta.env.UPSTASH_API_KEY}`
  )

  const response = await fetch(request)

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const { result } = await response.json()

  return result as string
}
