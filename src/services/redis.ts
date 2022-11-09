import { Redis } from '@upstash/redis'

console.log({
  url: Deno.env.get('UPSTASH_REDIS_REST_URL'),
  token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN'),
})

export const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_REST_URL'),
  token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN'),
})
