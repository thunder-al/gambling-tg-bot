import {createInstance, type i18n as I18n} from 'i18next'
import ruMessages from './ru.yaml'

export {type i18n as I18n} from 'i18next'

export const i18n: I18n = createInstance({
  lng: 'ru',
  fallbackLng: 'ru',
  resources: {
    ru: {
      translation: ruMessages,
    },
  },
})

i18n.init().catch(err => {
  console.error('i18n init error:', err)
  process.exit(1)
})
