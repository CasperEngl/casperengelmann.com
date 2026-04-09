import { createClient } from 'redis'
import { REDIS_URL } from 'astro:env/server'

export const redis = createClient({
  url: REDIS_URL,
})
