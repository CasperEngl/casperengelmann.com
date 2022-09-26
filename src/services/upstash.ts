type Nullable<T> = T | null

export async function upstashRequest<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
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

  try {
    // return json if it is parsable
    return JSON.parse(result) as Nullable<T>
  } catch (error) {
    // return string if it is not parsable
    if (error instanceof SyntaxError) {
      return result
    }
  }
}
