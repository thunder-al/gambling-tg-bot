import {pino} from 'pino'
import {PrettyOptions} from 'pino-pretty'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: <PrettyOptions>{
      translateTime: 'SYS:yyyy-mm-dd\'T\'HH:MM:sso',
      ignore: 'pid,hostname',
    },
  },
})

