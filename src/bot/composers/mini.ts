import {Conversation} from '@grammyjs/conversations'
import {Composer, InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {i18n} from '../../i18n'
import {rand, sleep} from '../../util/functional'

export function createMiniComposer() {
  const c = new Composer<Context>()

  c.callbackQuery('start-minigames', async ctx => {
    await ctx.answerCallbackQuery()
    await ctx.conversation.enter('mini-conversation')
  })

  return c
}

export async function miniConversation(conv: Conversation<Context, Context>, ctx: Context) {
  // Step 1: Game selection
  await ctx.reply(
    i18n.t('mini.choose-game.msg'),
    {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard()
        .text(i18n.t('mini.games.luckyjet'), 'mini-game-luckyjet').row()
        .text(i18n.t('mini.games.luckyjet_analogues'), 'mini-game-luckyjet_analogues').row()
        .text(i18n.t('main-menu'), 'start'),
    },
  )

  let gameKey = ''
  const res = await conv.waitForCallbackQuery(
    ['mini-game-luckyjet', 'mini-game-luckyjet_analogues'],
    {
      otherwise: async () => {
      },
    },
  )

  if (!res?.callbackQuery?.data || res.callbackQuery.data === 'start') {
    return
  }

  if (res.callbackQuery.data === 'mini-game-luckyjet') {
    gameKey = 'luckyjet'
  }

  if (res.callbackQuery.data === 'mini-game-luckyjet_analogues') {
    gameKey = 'luckyjet_analogues'
  }

  // Step 2: Instruction
  await ctx.reply(
    i18n.t(`mini.${gameKey}.instruction`),
    {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard().text(i18n.t('main-menu'), 'start'),
    },
  )

  // Step 3: Wait for user input (text)
  const userInput = await conv.waitFor(':text', {
    otherwise: (ctx) => ctx.reply(i18n.t('mini.input-error'), {parse_mode: 'HTML'}),
  })

  await ctx.reply(
    i18n.t('mini.analysis-start.msg'),
    {parse_mode: 'HTML'},
  )
  await conv.external(async () => await sleep(rand(1000, 3000)))

  // Step 4: Prediction
  await ctx.reply(
    generateMiniPrediction(gameKey),
    {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard().text(i18n.t('main-menu'), 'start'),
    },
  )
}

function generateMiniPrediction(gameKey: string): string {
  if (gameKey === 'luckyjet') {
    // Example: "Следующая игра: x7, вероятность: 96%"
    const x = rand(3, 15)
    const chance = rand(80, 99)
    return `Следующая игра: x${x}, вероятность: ${chance}%`
  }

  if (gameKey === 'luckyjet_analogues') {
    // Example: "x7 шанс 96%"
    const x = rand(2, 10)
    const chance = rand(60, 98)
    return `x${x} шанс ${chance}%`
  }

  return 'Нет предсказания.'
}

