import type {Context} from './context'
import {logger} from '../logger'
import {BotError} from 'grammy'

export function grammyLogger(ctx: Context, next: () => Promise<void>) {
  ctx.logger = logger.child({
    update_id: ctx.update.update_id,
    from_id: ctx.from?.id,
    from_name: ctx.from?.username
      ? `@${ctx.from?.username} ${ctx.from?.first_name} ${ctx.from?.last_name ?? ''}`.trim()
      : `${ctx.from?.first_name} ${ctx.from?.last_name ?? ''}`.trim(),
  })

  return next()
}

export function grammyErrorHandler(err: BotError<Context>) {
  const errMsg = 'stack' in err ? err.stack : err.error
  err.ctx.logger.error(errMsg)
}