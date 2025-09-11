import {Command} from 'commander'
import {databaseConnect, databaseDisconnect, wipeDatabase} from '@/db'
import {logger} from '@/logger.ts'

export default function dbCommand(baseCmd: Command) {
  const cmd = baseCmd.command('db')
    .description('Database commands')

  cmd.command('migrate')
    .description('Run database migrations')
    .option('--fresh', 'Drop all tables before migrate')
    .action(async (opts) => {

      await databaseConnect()

      if (opts.fresh) {
        await wipeDatabase()
      }

      logger.info('Running migrations')

      const {migrator} = await import('../db/migrations.ts')

      let hasMigrations = true
      while (hasMigrations) {
        const result = await migrator.migrateUp()

        if (result.error) {
          throw result.error
        }

        const executed = result.results || []

        for (const res of executed) {
          logger.info(`${res.direction} ${res.status} ${res.migrationName}`)
        }

        hasMigrations = executed.length > 0
      }

      logger.info('Migrations done')

      await databaseDisconnect()
    })
}
