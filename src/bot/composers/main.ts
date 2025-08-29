import {Composer, InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {i18n} from '../../i18n'

async function startMessage(ctx: Context) {
  await ctx.reply(
    i18n.t('start.msg', {
      botName: ctx.me.username,
      referralLink: 'https://example.com/',
    }),
    {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard()
        .text(i18n.t('games.slots'), 'start-slots')
        .text(i18n.t('games.live'), 'start-live')
        .text(i18n.t('games.minigames'), 'start-minigames'),
    },
  )
}

export function createMainComposer() {
  const c = new Composer<Context>()

  c.command('start', startMessage)

  c.callbackQuery('start', async ctx => {
    await ctx.answerCallbackQuery()
    await startMessage(ctx)
  })

  return c
}