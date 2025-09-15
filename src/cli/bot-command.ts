import {Command} from 'commander'
import {databaseConnect, databaseDisconnect, db} from '@/db'
import {startTelegramBots, stopTelegramBots} from '@/telegram'
import {onShutdown} from '../util/process.ts'
import {safePromise} from '@/util/functional.ts'
import {redisConnect, redisDisconnect} from '@/services/redis.ts'
import axios from 'axios'

export default function appCommand(cmd: Command) {
  cmd.command('tg:start')
    .description('Start telegram bot')
    .action(async () => {
      onShutdown(async (code) => {
        await safePromise(stopTelegramBots())
        await safePromise(databaseDisconnect())
        await safePromise(redisDisconnect())
      })

      await redisConnect()
      await databaseConnect()
      await startTelegramBots()
    })

  cmd.command('tg:add')
    .description('Add telegram bot to the database')
    .argument('<token>', 'Telegram bot token')
    .action(async (token: string) => {
      await databaseConnect()

      // Validate token with Telegram API
      interface Response {
        ok: boolean
        result: {
          id: number
          is_bot: boolean
          username: string
        }
      }

      const [resp, err] = await safePromise(axios.get<Response>(`https://api.telegram.org/bot${token}/getMe`))
      if (err || !resp.data.ok) {
        console.error('Invalid bot token')
        process.exit(1)
      }

      const data = resp.data.result

      if (!data.is_bot) {
        console.error('Provided token is not a bot')
        process.exit(1)
      }

      if (!data.username || !data.id) {
        console.error('Failed to get bot username or ID')
        process.exit(1)
      }

      const inserted = await db.insertInto('bots')
        .values({
          token: token,
          tg_id: data.id,
          tg_username: data.username,
        })
        .onConflict(c =>
          c.columns(['tg_id']).doUpdateSet(qb => ({
            token: token,
            tg_id: data.id,
            tg_username: data.username,
            active: true,
            created_at: qb.fn('NOW'),
          })),
        )
        .returning(['id', 'tg_id', 'tg_username'])
        .executeTakeFirstOrThrow()

      console.log('Bot added successfully', inserted)

      await databaseDisconnect()
    })
}
