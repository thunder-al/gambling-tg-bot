import {Telegraf} from 'telegraf'
import {globalUserProcessMiddleware} from './middleware/global-user-process.ts'
import {pingCommand} from './actions/ping-command.ts'
import {mainMenuAction} from '@/telegram/actions/main-menu.ts'
import {AppContext} from '@/telegram/context.ts'
import {livePredictionScene} from '@/telegram/scenes/live.ts'
import {miniGameScene} from '@/telegram/scenes/mini.ts'
import {slotsScene} from '@/telegram/scenes/slots.ts'

export async function registerActions(bot: Telegraf<AppContext>) {
  // bypass main middleware
  // we need it working even if bot working in white list mode
  bot.use(pingCommand())

  // authorize user
  // all next actions will have user in context
  bot.use(globalUserProcessMiddleware())

  // scenes
  bot.use(livePredictionScene)
  bot.use(miniGameScene)
  bot.use(slotsScene)

  // other actions

  bot.action('start-live', ctx => ctx.enterScene(livePredictionScene))
  bot.action('start-minigames', ctx => ctx.enterScene(miniGameScene))
  bot.action('start-slots', ctx => ctx.enterScene(slotsScene))

  bot.use(mainMenuAction())
}
