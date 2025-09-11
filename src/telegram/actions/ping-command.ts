import {Composer} from 'telegraf'
import {botLogger} from '../index.ts'

/**
 * Ping command to get user id and other data
 * even if the bot is working in white list mode
 */
export function pingCommand() {
  return Composer.command('ping', (ctx) => {
    botLogger.warn({
      msg: `Got ping command from #${ctx.from?.id || 'unknown'}`,
      message: ctx.message,
    })
  })
}
