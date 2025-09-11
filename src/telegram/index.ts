import {Telegraf, session} from 'telegraf'
import {logger} from '@/logger.ts'
import {config} from '@/config.ts'
import {registerActions} from './actions.ts'
import {AppContext} from '@/telegram/context.ts'
import {createSessionPlugin} from '@/telegram/session.ts'

export const bot = new Telegraf<AppContext>(config.TELEGRAM_BOT_TOKEN, {
  contextType: AppContext,
})

export const botLogger = logger.child({name: 'telegram'})

bot.catch((err, ctx) => {
  botLogger.error({
    msg: `Error for ${ctx.updateType}#${ctx.msgId}`,
    message_type: ctx.updateType,
    message: ctx.message,
    err,
  })
})

export async function startTelegramBot() {
  if (!bot.telegram.token) {
    throw new Error('Telegram bot token is not provided. Env variable TELEGRAM_BOT_TOKEN is missing.')
  }

  const info = await bot.telegram.getMe()

  botLogger.info(`Starting bot @${info.username} (${info.id}) https://t.me/${info.username}`)

  bot.use(createSessionPlugin())

  await registerActions(bot)

  await bot.launch()
}

export function stopTelegramBot(reason: string) {
  botLogger.info(`Stopping bot: ${reason}`)
  bot.stop(reason)
}
