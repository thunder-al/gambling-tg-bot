import {Conversation} from '@grammyjs/conversations'
import {Composer, InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {i18n} from '../../i18n'
import {rand, roundDimension, scaleValue, sleep} from '../../util/functional'

export function createSlotsComposer() {
  const c = new Composer<Context>()

  c.callbackQuery('start-slots', async ctx => {
    await ctx.answerCallbackQuery()
    await ctx.conversation.enter('slots-conversation')
  })

  return c
}

export async function slotsConversation(conv: Conversation<Context, Context>, ctx: Context) {
  await ctx.reply(
    i18n.t('slots.conversation-start.msg'),
    {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard()
        .text(i18n.t('back'), 'start'),
    },
  )

  const photoMsg = await conv.waitFor(':photo', {
    otherwise: (ctx) => ctx.reply(
      i18n.t('slots.conversation-start.error.not-a-image'),
      {parse_mode: 'HTML'},
    ),
  })

  /*
   * I dont care about the photo so far
   */

  await ctx.reply(
    i18n.t('slots.conversation-analysis-start.msg'),
    {parse_mode: 'HTML'},
  )

  // fake processing
  await conv.external(async () => await sleep(rand(1000, 3000)))

  const predict = await conv.external(() => generatePredictedSlots(ctx.from!.id))

  await ctx.reply(
    i18n.t('slots.conversation-result.msg', {
      nextGame: predict.nextGame,
      chanceToWin: predict.chanceToWin,
    }),
    {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard()
        .text(i18n.t('main-menu'), 'start').row()
        .text(i18n.t('once-again'), 'start-slots').row()
    },
  )

}

function generatePredictedSlots(userId: number) {
  const timeInMinutes = Math.floor(Date.now() / 60000)
  const seed = userId + timeInMinutes / 5 // change every 5 minutes for same user

  return {
    nextGame: Math.round(scaleValue(20, 99, randomFromSeed(seed + 1))),
    chanceToWin: roundDimension(scaleValue(40, 70, randomFromSeed(seed + 2))),
  }
}

function randomFromSeed(seed: number): number {
  // Mix seed with some bitwise operations and math
  let x = Math.sin(seed) * 10000
  x = (x ^ (x << 13)) >>> 0
  x = (x ^ (x >> 17)) >>> 0
  x = (x ^ (x << 5)) >>> 0
  // Map to [0, 1)
  return (x % 1000000) / 1000000
}