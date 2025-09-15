import {logger} from '@/logger.ts'
import {reconcileTgBots, stopTgBotPool} from '@/telegram/pool.ts'
import {sleep} from '@/util/functional.ts'

export const botLogger = logger.child({name: 'telegram'})

let isRunning = false

export async function startTelegramBots() {
  if (isRunning) {
    botLogger.warn('Telegram bots are already running')
    return
  }

  isRunning = true
  let isFirstLoop = true

  while (isRunning) {
    const status = await reconcileTgBots()
    if (status.added || status.removed || status.failed) {
      botLogger.info(`Telegram bot reconciliation complete: active=${status.active} added=${status.added} removed=${status.removed} failed=${status.failed}`)
    }

    if (isFirstLoop && status.active === 0) {
      botLogger.warn(`No bots started. Use \`node start.mjs tg:add TOKEN\` to add some`)
    }

    isFirstLoop = false

    await sleep(30_000)
  }
}

export async function stopTelegramBots() {
  await stopTgBotPool()
}
