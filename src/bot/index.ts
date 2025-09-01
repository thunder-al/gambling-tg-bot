import {Bot} from 'grammy'
import {hydrate} from '@grammyjs/hydrate'
import {config} from '../config'
import {onShutdown} from '../util/process'
import {Context} from './context'
import {grammyErrorHandler, grammyLogger} from './plugins'
import {logger} from '../logger'
import {createMainComposer} from './composers/main'
import {conversations, createConversation} from '@grammyjs/conversations'
import {createSlotsComposer, slotsConversation} from './composers/slots'
import {createLiveComposer, liveConversation} from './composers/live'

export function createBot() {

  const bot = new Bot<Context>(config.TELEGRAM_BOT_TOKEN)

  bot.use(hydrate())
  bot.use(conversations())
  bot.use(grammyLogger)
  bot.catch(grammyErrorHandler)

  bot.use(createConversation(slotsConversation, {id: 'slots-conversation'}))
  bot.use(createConversation(liveConversation, {id: 'live-conversation'}))

  bot.use(createMainComposer())
  bot.use(createSlotsComposer())
  bot.use(createLiveComposer())

  async function start() {
    await bot.init()
    logger.info(`Starting bot at @${bot.botInfo.username} #${bot.botInfo.id}`)
    await bot.start()
    onShutdown(async () => await bot.stop())
  }

  return {
    bot,
    start,
  }
}