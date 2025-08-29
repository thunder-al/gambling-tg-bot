import {createBot} from './bot'

// noinspection JSUnusedGlobalSymbols
export async function main() {
  const bot = createBot()

  await bot.start()
}
