import { createClient } from 'redis'

export const redis = createClient({ url: 'redis://redis:6380' })
