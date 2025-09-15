import {ColumnType, Generated, Selectable} from 'kysely'

type TDateField = ColumnType<Date, Date | string, Date | string>
type TNullableDateField = ColumnType<Date | null, Date | string | null, Date | string | null>
type TAutoDateField = ColumnType<Date, Date | string | undefined, Date | string>
type TAutoBigNumberField = ColumnType<string, string | number | undefined, string | number | undefined>
type TBigNumberField = ColumnType<string, string | number, string | number>
type TANullableDateField = ColumnType<Date | null, Date | string | null | undefined, Date | string | null | undefined>
type TNullable<T> = ColumnType<T | null, string | null | undefined, string | null | undefined>
type TJsonValue<T> = ColumnType<T, T | string, T | string>
type TAutoJsonValue<T> = ColumnType<T, T | string | undefined, T | string>

export type DbEntity<T extends keyof DB> = Selectable<DB[T]>

export interface DB {

  users: {
    id: Generated<string>
    tg_id: string
    /**
     * Unique string for referral url
     */
    referrer_str: Generated<string>
    /**
     * Who referred this user
     */
    referred_by_id: TNullable<string>
    /**
     * When user got referred
     */
    referred_at: TANullableDateField
    username: TNullable<string>
    name: string
    admin: Generated<boolean>
    permissions: Generated<Array<string>>
    created_at: TAutoDateField
  },

  bots: {
    id: TAutoBigNumberField
    token: string
    tg_id: TBigNumberField
    tg_username: string
    active: Generated<boolean>
    data: TAutoJsonValue<Record<string, any> & { referral_link?: string }>
    user_id: TNullable<TBigNumberField>
    created_at: TAutoDateField
  }

  bot_user: {
    bot_id: TBigNumberField
    user_id: TBigNumberField
    last_active: TAutoDateField
    created_at: TAutoDateField
    data: TAutoJsonValue<Record<string, any>>
  }
}
