import {Telegraf} from 'telegraf'
import {AppContext} from '@/telegram/context.ts'
import {db} from '@/db'
import {botLogger} from '@/telegram/index.ts'
import {session} from 'telegraf/session'
import {redis, redisKey} from '@/services/redis.ts'
import {registerActions} from '@/telegram/actions.ts'
import {safeJsonParse} from '@/util/functional.ts'

const bots = new Map<string, Telegraf<AppContext>>()

let reconcilePromise: ReturnType<typeof reconcileBotsInternal> | null = null

export function reconcileTgBots() {
  if (reconcilePromise) {
    return reconcilePromise
  }

  reconcilePromise = reconcileBotsInternal()
  return reconcilePromise
}

async function reconcileBotsInternal() {
  const dbBots = await db.selectFrom('bots')
    .select(['id', 'tg_id', 'token'])
    .where('active', '=', true)
    .execute()

  const status = {
    added: 0,
    failed: 0,
    removed: 0,
    active: 0,
  }

  // Start new bots
  await Promise.all(dbBots.map(async (bot) => {
    if (!bots.has(bot.id)) {
      try {
        await startBot(bot.id, bot.token)
        status.added++
        status.active++
      } catch (ignore) {
        status.failed++
      }
    } else {
      status.active++
    }
  }))

  // Stop removed bots
  const removedIds = Array.from(bots.keys())
    .filter(id => !dbBots.some(dbBot => dbBot.id === id))

  await Promise.all(removedIds.map(async (id) => {
    await stopBot(id)
    status.removed++
  }))

  reconcilePromise = null

  return status
}

export async function stopTgBotPool() {
  if (reconcilePromise) {
    await reconcilePromise
    reconcilePromise = null
  }

  await Promise.all(Array.from(bots.keys()).map(id => stopBot(id)))
}

/**
 * Creates and starts the bot
 */
async function startBot(id: string, botToken: string) {
  if (bots.has(id)) {
    botLogger.warn(`Bot with ID ${id} is already active`)
    return
  }

  const botRecord = await db.selectFrom('bots')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
  if (!botRecord) {
    throw new Error(`Bot with ID ${id} not found in database`)
  }

  const bot = new Telegraf<AppContext>(botToken, {
    contextType: AppContext,
  })

  // error handling
  bot.catch((err, ctx) => {
    botLogger.error({
      msg: `Error in bot #${id} for ${ctx.updateType}#${ctx.msgId}`,
      message_type: ctx.updateType,
      message: ctx.message,
      err,
    })
  })

  // check that bot is valid
  try {

    await bot.telegram.getMe()

  } catch (e) {

    // mark as inactive/invalid
    await db.updateTable('bots')
      .set({active: false})
      .where('id', '=', id)
      .execute()

    botLogger.error(`Bot with ID ${id} is invalid or inactive`)

    throw e
  }

  bot.use(session({
    getSessionKey: ctx => redisKey(`bot-${id}:chat-${ctx.chat?.id ?? null}:from-${ctx.from?.id ?? null}`),
    defaultSession: () => ({}),
    store: {
      get: async (key) => await safeJsonParse(await redis.get(key)),
      set: async (key, val) => redis.set(key, JSON.stringify(val), {EX: 60 * 60 * 24 * 2}), // max 2 day session
      delete: async (key) => redis.del(key),
    },
  }))

  // register actions
  await registerActions(bot)

  bots.set(id, bot)

  // start bot in detached macrotask
  // polling mode holds launch await call, but webhook mode does not
  // currently only polling mode is supported
  const launch = bot.launch()

  launch.catch(err => {
    botLogger.error(`Failed to start bot ${id}: ${err.message}`)
    botLogger.debug(err.stack)

    try {
      bot.stop('error')
    } catch (ignore) {
    }

    bots.delete(id)
  })
}

/**
 * Stops the bot by ID
 */
async function stopBot(id: string) {
  const bot = bots.get(id)
  if (!bot) {
    botLogger.warn(`Bot with ID ${id} is not active`)
    return
  }

  try {
    bot.stop('shutdown')
    botLogger.info(`Bot with ID ${id} stopped successfully`)
  } catch (err: any) {
    botLogger.error(`Failed to stop bot ${id}: ${err.message}`)
  }

  bots.delete(id)
}
