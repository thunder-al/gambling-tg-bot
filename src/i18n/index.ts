import {createInstance, type i18n as I18n} from 'i18next'
import ruMessages from './ru.yaml'
import enTranslations from './en.yaml'
import hiMessages from './hi.yaml'
import bnMessages from './bn.yaml'
import trMessages from './tr.yaml'
import esMessages from './es.yaml'

export {type i18n as I18n} from 'i18next'

export const i18n: I18n = createInstance({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    ru: {
      translation: ruMessages,
    },
    en: {
      translation: enTranslations,
    },
    hi: {
      translation: hiMessages,
    },
    bn: {
      translation: bnMessages,
    },
    tr: {
      translation: trMessages,
    },
    es: {
      translation: esMessages,
    },
  },
})

i18n.init().catch(err => {
  console.error('i18n init error:', err)
  process.exit(1)
})
