import {createStagedScene} from '@/telegram/scenes/staged-schene.ts'
import {Markup} from 'telegraf'
import {rand, sleep} from '@/util/functional.ts'
import filters from 'telegraf/filters'
import {AppContext} from '@/telegram/context.ts'

export const miniGameScene = createStagedScene('mini-game-scene')

miniGameScene.global().action('start', async (ctx, next) => {
  ctx.leaveScene()
  await next()
})

miniGameScene.onEnter(async ctx => {
  ctx.setScheneStage('choose-game')

  await ctx.replyI18n(
    'mini.choose-game.msg',
    {},
    Markup.inlineKeyboard([
      [Markup.button.callback(ctx.t('mini.games.luckyjet'), 'mini-game:luckyjet')],
      [Markup.button.callback(ctx.t('mini.games.luckyjet_analogues'), 'mini-game:luckyjet_analogues')],
      [Markup.button.callback(ctx.t('mini.games.coinflip'), 'mini-game:coinflip')],
      [Markup.button.callback(ctx.t('mini.games.plinko'), 'mini-game:plinko')],
      [Markup.button.callback(ctx.t('main-menu'), 'start')],
    ]),
  )
})

const allowedGames = [
  'luckyjet',
  'luckyjet_analogues',
  'coinflip',
  'plinko',
]

miniGameScene.stage('choose-game').action(/mini-game:(\w+)/, async ctx => {
  const gameKey = ctx.match[1]

  if (!allowedGames.includes(gameKey)) {
    await ctx.replyI18n('error', {}, Markup.inlineKeyboard([
      [Markup.button.callback(ctx.t('main-menu'), 'start')],
    ]))

    ctx.leaveScene()
    return
  }

  ctx.sceneState!.session.gameKey = gameKey

  await ctx.replyI18n(
    `mini.${gameKey}.instruction`,
    {},
    Markup.inlineKeyboard([
      [Markup.button.callback(ctx.t('main-menu'), 'start')],
    ]),
  )

  ctx.setScheneStage('instruction')
})

miniGameScene.stage('instruction').on(filters.message('text'), async ctx => {
  const input = ctx.message.text
  const gameKey = ctx.sceneState!.session.gameKey as string

  if (gameKey === 'coinflip') {
    if (!/^\s*[ОР]+\s*$/i.test(input)) {
      await ctx.replyI18n('mini.input-error-coinflip')
      return
    }
  } else {
    if (!/^(?:\s*x\d+(?:[.,]\d+)?(?:[,;]\s*|[,;]?\s+))+\s*x\d+(?:[.,]\d+)?$/i.test(input)) {
      await ctx.replyI18n('mini.input-error')
      return
    }
  }

  await ctx.replyI18n('mini.analysis-start.msg')

  // Simulate analysis time
  await sleep(rand(1000, 3000))


  await ctx.replyI18n(
    generateMiniPrediction(ctx, gameKey),
    {},
    Markup.inlineKeyboard([
      [Markup.button.callback(ctx.t('main-menu'), 'start')],
      [Markup.button.callback(ctx.t('once-again'), 'start-minigames')],
    ]),
  )

  ctx.leaveScene()
})

function generateMiniPrediction(ctx: AppContext, gameKey: string) {
  if (gameKey === 'luckyjet') {
    const x = rand(3, 15)
    const chance = rand(80, 99)
    return ctx.t('mini.result-simple.msg', {x, chance})
  }

  if (gameKey === 'luckyjet_analogues') {
    const x = rand(2, 10)
    const chance = rand(60, 98)
    return ctx.t('mini.result-simple.msg', {x, chance})
  }

  if (gameKey === 'plinko') {
    const prediction = rand(30, 70)
    return ctx.t('mini.result-plinko.msg', {prediction})
  }

  if (gameKey === 'coinflip') {
    const prediction = Array(5).fill(0)
      .map(() => ['О', 'Р'][rand(0, 1)])
      .join(', ')

    return ctx.t('mini.result-coinflip.msg', {prediction})
  }

  return ctx.t('error')
}

