import {createClient} from 'redis'
import {config} from '@/config.ts'
import {logger} from '@/logger.ts'

const redisLogger = logger.child({name: 'redis'})

export const redis = createClient({
  url: config.REDIS_URL,
})

redis.on('err', error => {
  redisLogger.error(error)
})

export function redisKey(key: string) {
  return `gambling-tg-bot:${key}`
}

export async function redisConnect() {
  redisLogger.info('Connecting to redis')
  await redis.connect()
}

export async function redisDisconnect() {
  redisLogger.info('Disconnecting from redis')
  redis.destroy()
}
