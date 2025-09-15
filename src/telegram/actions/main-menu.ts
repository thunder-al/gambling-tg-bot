import {Composer, Markup} from 'telegraf'
import {userSvc} from '@/services/user-service.ts'
import {db} from '@/db'
import {AppContext} from '@/telegram/context.ts'
import {i18n} from '@/i18n'

export function mainMenuAction() {
  return Composer.compose<AppContext>([
    Composer.command<AppContext>('start', async ctx => {
      await handleStartPayload(ctx, ctx.payload)
      await printMainMessage(ctx)
    }),
    Composer.action(['start', 'msg-start'], ctx => printMainMessage(ctx)),
  ])
}

async function handleStartPayload(ctx: AppContext, payload: string) {
  payload = payload.trim()

  // check for referral code
  if (payload.startsWith('UR')) {
    await db.transaction().execute(async trx => {
      await userSvc.handleReferralCodeOnUser(
        payload,
        ctx.user.id,
        trx,
      )
    })

    return
  }
}

async function printMainMessage(ctx: AppContext) {
  await ctx.replyI18n(
    'start.msg',
    {
      botName: ctx.botRecord.data.name || 'Casino Bot',
      referralLink: ctx.botRecord.data.referral_link || 'N/A',
    },
    {
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback(i18n.t('games.slots'), 'start-slots'),
        Markup.button.callback(i18n.t('games.live'), 'start-live'),
        Markup.button.callback(i18n.t('games.minigames'), 'start-minigames'),
      ]).reply_markup,
      link_preview_options: {is_disabled: true},
    },
  )
}
