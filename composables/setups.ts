import { pwaInfo } from 'virtual:pwa-info'
import type { Link } from '@unhead/schema'
import { APP_NAME, STORAGE_KEY_LANG } from '~/constants'

const isDev = process.dev
const isPreview = window.location.hostname.includes('deploy-preview')
const suffix = isDev || isPreview ? '-dev' : ''

export function setupPageHeader() {
  const i18n = useI18n()

  const link: Link[] = [
    { rel: 'icon', type: 'image/svg+xml', href: `/favicon${suffix}.svg` },
    { rel: 'alternate icon', type: 'image/x-icon', href: `/favicon${suffix}.ico` },
    { rel: 'icon', type: 'image/png', href: `/favicon-16x16${suffix}.png`, sizes: '16x16' },
    { rel: 'icon', type: 'image/png', href: `/favicon-32x32${suffix}.png`, sizes: '32x32' },
  ]

  if (pwaInfo && pwaInfo.webManifest) {
    link.push({
      rel: 'mask-icon',
      href: '/safari-pinned-tab.svg',
      color: '#ffffff',
    })
    link.push({
      rel: 'apple-touch-icon',
      href: `/apple-touch-icon${suffix}.png`,
      sizes: '180x180',
    })
    const { webManifest } = pwaInfo
    if (webManifest) {
      const { href, useCredentials } = webManifest
      if (useCredentials) {
        link.push({
          rel: 'manifest',
          href,
          crossorigin: 'use-credentials',
        })
      }
      else {
        link.push({
          rel: 'manifest',
          href,
        })
      }
    }
  }

  useHeadFixed({
    htmlAttrs: {
      lang: () => i18n.locale.value,
    },
    titleTemplate: title => `${title ? `${title} | ` : ''}${APP_NAME}${isDev ? ' (dev)' : isPreview ? ' (preview)' : ''}`,
    bodyAttrs: {
      class: 'overflow-x-hidden',
    },
    link,
    meta: [{ name: 'theme-color', content: '#ffffff' }],
  })

  // eslint-disable-next-line no-unused-expressions
  isDark.value
}

export async function setupI18n() {
  const { locale, setLocale, locales } = useI18n()
  const isFirstVisit = !window.localStorage.getItem(STORAGE_KEY_LANG)
  const localeStorage = useLocalStorage(STORAGE_KEY_LANG, locale.value)

  if (isFirstVisit) {
    const userLang = (navigator.language || 'en-US').toLowerCase()
    // cause vue-i18n not explicit export LocaleObject type
    const supportLocales = unref(locales) as { code: string }[]
    const lang = supportLocales.find(locale => userLang.startsWith(locale.code.toLowerCase()))?.code
      || supportLocales.find(locale => userLang.startsWith(locale.code.split('-')[0]))?.code
    localeStorage.value = lang || 'en-US'
  }

  if (localeStorage.value !== locale.value)
    await setLocale(localeStorage.value)

  watchEffect(() => {
    localeStorage.value = locale.value
  })
}
