import {MiddlewareFn} from 'telegraf'
import {AppContext} from '@/telegram/context.ts'
import {db} from '@/db'

/**
 * Middleware that handles initial user processing and basic authorization checks
 */
export function globalUserProcessMiddleware(): MiddlewareFn<AppContext> {
  return async function (ctx, next) {

    // drop messages from bots and other non-user entities
    if (!ctx.from || ctx.from.is_bot) {
      return
    }

    // consume and apply user
    ctx.user = await db.insertInto('users')
      .values({
        tg_id: `${ctx.from.id}`,
        username: ctx.from.username ? `${ctx.from.username}` : null,
        name: `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim(),
      })
      .onConflict((oc) => oc
        .column('tg_id')
        .doUpdateSet(qb => ({
          username: qb.ref('excluded.username'),
          name: qb.ref('excluded.name'),
        })),
      )
      .returningAll()
      .executeTakeFirstOrThrow()

    // update user-bot relationship
    await db.insertInto('bot_user')
      .values({
        bot_id: ctx.botRecord.id,
        user_id: ctx.user.id,
      })
      .onConflict((oc) => oc
        .column('bot_id')
        .column('user_id')
        .doUpdateSet(qb => ({
          last_active: db.fn('NOW'),
        })),
      )
      .execute()

    // continue processing
    await next()
  }
}
