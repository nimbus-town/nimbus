import type { NuxtI18nOptions } from '@nuxtjs/i18n'
import type { DateTimeFormats, NumberFormats, PluralizationRule, PluralizationRules } from '@intlify/core-base'

import type { LocaleObject } from '#i18n'

interface LocaleObjectData extends LocaleObject {
  numberFormats?: NumberFormats
  dateTimeFormats?: DateTimeFormats
  pluralRule?: PluralizationRule
}

// @ts-expect-error dir is there, ts complaining
const locales: LocaleObjectData[] = [
  {
    code: 'en-US',
    file: 'en-US.json',
    name: 'English',
  },
  {
    code: 'de-DE',
    file: 'de-DE.json',
    name: 'Deutsch',
  },
  {
    code: 'zh-CN',
    file: 'zh-CN.json',
    name: '简体中文',
  },
  {
    code: 'ja-JP',
    file: 'ja-JP.json',
    name: '日本語',
  },
  {
    code: 'es-ES',
    file: 'es-ES.json',
    name: 'Español',
  },
  {
    code: 'fr-FR',
    file: 'fr-FR.json',
    name: 'Français',
  },
  {
    code: 'cs-CZ',
    file: 'cs-CZ.json',
    name: 'Česky',
  },
  {
    code: 'ar-EG',
    file: 'ar-EG.json',
    name: 'العربية',
    dir: 'rtl',
    /* TODO: include this once ar-EG ready for all plurals updated
    pluralRule: (choice: number) => {
      const name = new Intl.PluralRules('ar-EG').select(choice)
      return { zero: 0, one: 1, two: 2, few: 3, many: 4, other: 5 }[name]
    },
*/
  },
].sort((a, b) => a.code.localeCompare(b.code))

const datetimeFormats = Object.values(locales).reduce((acc, data) => {
  const dateTimeFormats = data.dateTimeFormats
  if (dateTimeFormats) {
    acc[data.code] = { ...dateTimeFormats }
    delete data.dateTimeFormats
  }
  else {
    acc[data.code] = {
      short: {
        dateStyle: 'short',
        timeStyle: 'short',
      },
      long: {
        dateStyle: 'long',
        timeStyle: 'medium',
      },
    }
  }

  return acc
}, <DateTimeFormats>{})

const numberFormats = Object.values(locales).reduce((acc, data) => {
  const numberFormats = data.numberFormats
  if (numberFormats) {
    acc[data.code] = { ...numberFormats }
    delete data.numberFormats
  }
  else {
    acc[data.code] = {
      percentage: {
        style: 'percent',
        maximumFractionDigits: 1,
      },
      smallCounting: {
        style: 'decimal',
        maximumFractionDigits: 0,
      },
      kiloCounting: {
        style: 'decimal',
        maximumFractionDigits: 1,
      },
      millionCounting: {
        style: 'decimal',
        maximumFractionDigits: 2,
      },
    }
  }

  return acc
}, <NumberFormats>{})

const pluralRules = Object.values(locales).reduce((acc, data) => {
  const pluralRule = data.pluralRule
  if (pluralRule) {
    acc[data.code] = pluralRule
    delete data.pluralRule
  }

  return acc
}, <PluralizationRules>{})

export const i18n: NuxtI18nOptions = {
  locales,
  strategy: 'no_prefix',
  detectBrowserLanguage: false,
  langDir: 'locales',
  defaultLocale: 'en-US',
  vueI18n: {
    fallbackLocale: 'en-US',
    fallbackWarn: false,
    missingWarn: false,
    datetimeFormats,
    numberFormats,
    pluralRules,
  },
  lazy: true,
}
