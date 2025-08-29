import type {HydrateFlavor} from '@grammyjs/hydrate'
import type {Context as DefaultContext, SessionFlavor} from 'grammy'
import {logger} from '../logger'
import {ConversationFlavor} from '@grammyjs/conversations'

export interface SessionData {
}

interface ExtendedContextFlavor {
  logger: typeof logger
}

export type Context = ConversationFlavor<
  HydrateFlavor<
    DefaultContext &
    ExtendedContextFlavor &
    SessionFlavor<SessionData>
  >
>