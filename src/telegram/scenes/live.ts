import {createStagedScene} from '@/telegram/scenes/staged-schene.ts'
import {Markup} from 'telegraf'
import filters from 'telegraf/filters'
import {client} from '@/services/http-client.ts'
import sharp from 'sharp'
import {rand, sleep} from '@/util/functional.ts'

export const livePredictionScene = createStagedScene('live-prediction-scene')

livePredictionScene.global().action('start', async (ctx, next) => {
  ctx.leaveScene()
  await next()
})

livePredictionScene.onEnter(async ctx => {
  ctx.setScheneStage('image-upload')

  await ctx.replyI18n(
    'live.conversation-start.msg',
    {},
    Markup.inlineKeyboard([
      Markup.button.callback(ctx.t('main-menu'), 'start'),
    ]),
  )
})

livePredictionScene.stage('image-upload').on(
  filters.anyOf(
    filters.message('text'),
    filters.message('document'),
  ),
  async (ctx) => {
    await ctx.replyI18n('live.conversation-start.error.not-a-image')
  },
)

livePredictionScene.stage('image-upload').on(filters.message('photo'), async (ctx) => {
  const photo = ctx.message.photo
  if (!photo || photo.length === 0) {
    await ctx.replyI18n('live.conversation-start.error.not-a-image')
    return
  }

  await ctx.replyI18n('live.conversation-analysis-start.msg')

  const bestPhoto = photo.toSorted((a, b) => (b.width + b.height) - (a.width + a.height))[0]
  const fileLink = await ctx.telegram.getFileLink(bestPhoto.file_id)
  const photoData = await client.get<Uint8Array>(fileLink.href, {responseType: 'arraybuffer'})
  const photoImage = sharp(photoData.data)
  // FIXME: dont care about image for now

  // fake processing
  await sleep(rand(1000, 3000))

  // nextGame: random int 3-10
  // chanceToWin: random float 40.00-69.99 (2 decimals)
  const nextGame = rand(3, 10)
  const chanceToWin = (Math.random() * (69.99 - 40) + 40).toFixed(2)

  await ctx.replyI18n(
    'live.conversation-result.msg',
    {
      nextGame: String(nextGame),
      chanceToWin: String(chanceToWin),
    },
    Markup.inlineKeyboard([
      Markup.button.callback(ctx.t('main-menu'), 'start'),
    ]),
  )

  ctx.leaveScene()

})
