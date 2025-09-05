import {Conversation} from '@grammyjs/conversations'
import {Composer, InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {i18n} from '../../i18n'
import {rand, sleep} from '../../util/functional'

export function createLiveComposer() {
  const c = new Composer<Context>()

  c.callbackQuery('start-live', async ctx => {
    await ctx.answerCallbackQuery()
    await ctx.conversation.enter('live-conversation')
  })

  return c
}

export async function liveConversation(conv: Conversation<Context, Context>, ctx: Context) {

  // back button
  if (ctx.update.callback_query?.data === 'start') {
    await conv.halt({next: true})
  }

  await ctx.reply(
    i18n.t('live.conversation-start.msg'),
    {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard().text(i18n.t('main-menu'), 'start'),
    },
  )

  const photoMsg = await conv.waitFor(':photo', {
    async otherwise(ctx) {
      await ctx.reply(
        i18n.t('live.conversation-start.error.not-a-image'),
        {parse_mode: 'HTML'},
      )

      // back button
      if (ctx.update.callback_query?.data === 'start') {
        await conv.halt({next: true})
      }
    },
  })

  await ctx.reply(
    i18n.t('live.conversation-analysis-start.msg'),
    {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard().text(i18n.t('main-menu'), 'start'),
    },
  )

  // fake processing
  await conv.external(async () => await sleep(rand(1000, 3000)))

  const predict = await conv.external(() => generatePredictedLive())

  await ctx.reply(
    i18n.t('live.conversation-result.msg', {
      nextGame: predict.nextGame,
      chanceToWin: predict.chanceToWin,
    }),
    {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard().text(i18n.t('main-menu'), 'start'),
    },
  )
}

function generatePredictedLive() {
  // nextGame: random int 3-10
  // chanceToWin: random float 40.00-69.99 (2 decimals)
  const nextGame = rand(3, 10)
  const chanceToWin = (Math.random() * (69.99 - 40) + 40).toFixed(2)
  return {nextGame, chanceToWin}
}

