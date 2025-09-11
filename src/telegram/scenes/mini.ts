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
      [Markup.button.callback(ctx.t('main-menu'), 'start')],
    ]),
  )
})

miniGameScene.stage('choose-game').action(/mini-game:(\w+)/, async ctx => {
  const gameKey = ctx.match[1]

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

  if (!/^(?:\s*[xX]\d+(?:[.,]\d+)?(?:[,;]\s*|[,;]?\s+))+$/i.test(input)) {
    await ctx.replyI18n('mini.input-error')
    return
  }

  await ctx.replyI18n('mini.analysis-start.msg')

  // Simulate analysis time
  await sleep(rand(1000, 3000))

  const gameKey = ctx.sceneState!.session.gameKey as string

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

  return ctx.t('error')
}

