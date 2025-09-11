import {z} from 'zod'

const validator = z.object({
  /**
   * Secret key for the app encryption and validation.
   * Should be a 64-character hex value.
   */
  APP_SECRET: z.string().length(64),
  /**
   * Telegram bot token.
   */
  TELEGRAM_BOT_TOKEN: z.string(),
  /**
   * URL for connecting to the Postgres database.
   */
  DATABASE_URL: z.url(),
  /**
   * URL for connecting to the Redis server.
   */
  REDIS_URL: z.url().default('redis://localhost:6379'),
  /**
   * Referral link on a gambling platform
   */
  REFERRAL_LINK: z.url().default('https://google.com/'),
})

export const parse = validator.safeParse(process.env)

if (!parse.success) {
  console.error('Invalid env:', parse.error.message)
  process.exit(1)
}

export const config = parse.data
