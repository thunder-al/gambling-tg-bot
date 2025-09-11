import {Kysely, LogEvent, PostgresDialect, sql} from 'kysely'
import pg from 'pg'
import {logger as baseLogger} from '../logger.ts'
import {DB} from './database.ts'
import {config} from '../config.ts'

const logger = baseLogger.child({name: 'db'})

function kyselyLogger(event: LogEvent) {
  if (event.level === 'query') {
    logger.debug({
      query: event.query,
      duration: event.queryDurationMillis,
    }, 'Query')

    return
  }

  if (event.level === 'error') {
    logger.error({
      query: event.query,
      duration: event.queryDurationMillis,
      error: event.error,
    }, 'Query error')

    return
  }
}

const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
})

export const db = new Kysely<DB>({
  log: kyselyLogger,
  dialect: new PostgresDialect({
    pool: pool,
  }),
})

// show database notices with logger
pool.on('connect', client => {
  client.on('notice', msg => {
    logger.info(`PG notice severity=${msg.severity} ${msg.message}`)
  })
})

export async function databaseConnect() {
  logger.info('Connecting to database')
  await sql`SELECT 1`.execute(db)
}

export async function databaseDisconnect() {
  logger.info('Disconnecting from database')
  await db.destroy()
}

export async function wipeDatabase(schema: string = 'public') {
  logger.info(`Cleaning the schema ${schema}`)

  // params is not supported in ddl queries
  await sql.raw(`
    DROP SCHEMA ${schema} CASCADE;
    CREATE SCHEMA ${schema};
  `).execute(db)
}
