import {Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>) {
  await sql`
    CREATE TABLE bots (
      id           BIGSERIAL PRIMARY KEY,
      token        VARCHAR(60) NOT NULL,
      tg_id        BIGINT      NOT NULL UNIQUE,
      tg_username  VARCHAR(40) NOT NULL UNIQUE,
      active       BOOLEAN     NOT NULL DEFAULT TRUE,
      data         JSONB       NOT NULL DEFAULT '{}'::JSONB,
      user_id      BIGINT      NULL     REFERENCES users(id) ON DELETE CASCADE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE bot_user (
      bot_id       BIGINT      NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
      user_id      BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      last_active  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      data         JSONB       NOT NULL DEFAULT '{}'::JSONB,
      PRIMARY KEY (bot_id, user_id)
    );
  `.execute(db)
}

export async function down(db: Kysely<any>) {
  await sql`
    DROP TABLE bots;
  `.execute(db)
}
