import {createStagedScene} from '@/telegram/scenes/staged-schene.ts'
import {Markup} from 'telegraf'
import {rand, roundDimension, scaleValue, sleep} from '@/util/functional.ts'
import filters from 'telegraf/filters'
import {client} from '@/services/http-client.ts'
import sharp from 'sharp'

export const slotsScene = createStagedScene('slots-scene')

slotsScene.global().action('start', async (ctx, next) => {
  ctx.leaveScene()
  await next()
})

slotsScene.onEnter(async ctx => {
  ctx.setScheneStage('image-upload')
  await ctx.replyI18n(
    'slots.conversation-start.msg',
    {},
    Markup.inlineKeyboard([
      [Markup.button.callback(ctx.t('back'), 'start')],
    ]),
  )
})

slotsScene.stage('image-upload').on(
  filters.anyOf(
    filters.message('text'),
    filters.message('document'),
  ),
  async (ctx) => {
    await ctx.replyI18n('slots.conversation-start.error.not-a-image')
  },
)

slotsScene.stage('image-upload').on(filters.message('photo'), async ctx => {
  const photo = ctx.message.photo
  if (!photo || photo.length === 0) {
    await ctx.replyI18n('live.conversation-start.error.not-a-image')
    return
  }

  await ctx.replyI18n('slots.conversation-analysis-start.msg')

  const bestPhoto = photo.toSorted((a, b) => (b.width + b.height) - (a.width + a.height))[0]
  const fileLink = await ctx.telegram.getFileLink(bestPhoto.file_id)
  const photoData = await client.get<Uint8Array>(fileLink.href, {responseType: 'arraybuffer'})
  const photoImage = sharp(photoData.data)
  // FIXME: dont care about image for now

  // Simulate analysis time
  await sleep(rand(1000, 3000))

  const predict = generatePredictedSlots(ctx.from.id)

  await ctx.replyI18n(
    'slots.conversation-result.msg',
    {
      nextGame: String(predict.nextGame),
      chanceToWin: String(predict.chanceToWin),
    },
    Markup.inlineKeyboard([
      [Markup.button.callback(ctx.t('main-menu'), 'start')],
      [Markup.button.callback(ctx.t('once-again'), 'start-slots')],
    ]),
  )

  ctx.leaveScene()
})

function generatePredictedSlots(userId: number) {
  const timeInMinutes = Math.floor(Date.now() / 60000)
  const seed = userId + timeInMinutes / 5
  return {
    nextGame: Math.round(scaleValue(20, 99, randomFromSeed(seed + 1))),
    chanceToWin: roundDimension(scaleValue(40, 70, randomFromSeed(seed + 2))),
  }
}

function randomFromSeed(seed: number) {
  let x = Math.sin(seed) * 10000
  x = (x ^ (x << 13)) >>> 0
  x = (x ^ (x >> 17)) >>> 0
  x = (x ^ (x << 5)) >>> 0
  return (x % 1000000) / 1000000
}

