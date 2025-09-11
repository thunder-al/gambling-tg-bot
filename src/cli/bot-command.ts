import {Command} from 'commander'
import {databaseConnect, databaseDisconnect} from '@/db'
import {startTelegramBot, stopTelegramBot} from '@/telegram'
import {onShutdown} from '../util/process.ts'
import {safePromise} from '@/util/functional.ts'
import {redisConnect, redisDisconnect} from '@/services/redis.ts'

export default function botCommand(baseCmd: Command) {
  const cmd = baseCmd.command('bot')
    .description('Start telegram bot')
    .action(async () => {
      onShutdown(async (code) => {
        stopTelegramBot(code)
        await safePromise(databaseDisconnect())
        await safePromise(redisDisconnect())
      })

      await redisConnect()
      await databaseConnect()
      await startTelegramBot()
    })
}
