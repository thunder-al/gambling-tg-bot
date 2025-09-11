import {session} from 'telegraf'
import {redis} from '@/services/redis.ts'

export function createSessionPlugin() {
  return session({
    defaultSession: () => ({}),
    store: {
      async delete(key) {
        await redis.del(key)
      },
      async get(key) {
        const data = await redis.get(key)

        if (!data) {
          return undefined
        }

        try {
          return JSON.parse(data)
        } catch {
          return undefined
        }
      },
      async set(key, value) {
        await redis.set(key, JSON.stringify(value), {EX: 3600 * 24 * 7}) // 7-day expiration
      },
    },
  })
}
