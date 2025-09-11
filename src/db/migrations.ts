import {Migration, Migrator} from 'kysely'
import {db} from './index.ts'

const migrationModules = import.meta.glob<Migration>('./migrations/*.ts', {eager: true})

export const migrator = new Migrator({
  db: db,
  provider: {
    async getMigrations(): Promise<Record<string, Migration>> {
      const migrations: Record<string, Migration> = {}

      for (const [path, mod] of Object.entries(migrationModules)) {
        const name = path.replace(/^.+\//, '') // remove path
          .replace(/\.m?[tj]sx?$/, '') // remove extension

        migrations[name] = mod
      }

      const sortedMigrationNames = Object.keys(migrations).sort(
        // ascending sort by numbers in the name
        (a, b) => parseInt(a.replace(/\D/, '')) - parseInt(b.replace(/\D/, '')),
      )

      const sortedMigrations: Record<string, Migration> = {}

      for (const name of sortedMigrationNames) {
        sortedMigrations[name] = migrations[name]
      }

      return sortedMigrations
    },
  },
})
