import {Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>) {
  await sql`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      
      CREATE TABLE users
      (
          id               BIGSERIAL PRIMARY KEY,
          tg_id            BIGINT         NOT NULL UNIQUE,
          referrer_str     VARCHAR(16)    NOT NULL UNIQUE DEFAULT ENCODE(gen_random_bytes(8), 'hex'),
          referred_by_id   BIGINT         NULL            DEFAULT NULL REFERENCES users (id) ON DELETE SET NULL,
          referred_at      TIMESTAMPTZ    NULL            DEFAULT NULL,
          username         VARCHAR(255)   NULL            DEFAULT NULL,
          name             VARCHAR(255)   NOT NULL,
          admin            BOOL           NOT NULL        DEFAULT FALSE,
          permissions      JSONB          NOT NULL        DEFAULT '[]'::JSONB,
          created_at       TIMESTAMPTZ    NOT NULL        DEFAULT CURRENT_TIMESTAMP
      );

  `.execute(db)
}

export async function down(db: Kysely<any>) {
  await sql`
      DROP TABLE users;
  `.execute(db)
}
