import {Telegraf} from 'telegraf'
import {globalUserProcessMiddleware} from './middleware/global-user-process.ts'
import {pingCommand} from './actions/ping-command.ts'
import {mainMenuAction} from '@/telegram/actions/main-menu.ts'
import {AppContext} from '@/telegram/context.ts'
import {livePredictionScene} from '@/telegram/scenes/live.ts'

export async function registerActions(bot: Telegraf<AppContext>) {
  // bypass main middleware
  // we need it working even if bot working in white list mode
  bot.use(pingCommand())

  // authorize user
  // all next actions will have user in context
  bot.use(globalUserProcessMiddleware())

  // scenes
  bot.use(livePredictionScene)

  // other actions

  bot.action('start-live', ctx => ctx.enterScene(livePredictionScene))

  bot.use(mainMenuAction())
}
