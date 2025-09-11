import {MiddlewareFn} from 'telegraf'
import {userSvc} from '@/services/user-service.ts'
import {AppContext} from '@/telegram/context.ts'

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
    ctx.user = await userSvc.findOrCreateUser(
      `${ctx.from.id}`,
      ctx.from.username ?? null,
      `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim(),
    )

    // continue processing
    await next()
  }
}
