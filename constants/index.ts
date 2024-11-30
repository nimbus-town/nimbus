import type { mastodon } from 'masto'

export const APP_NAME = 'Nimbus'

export const DEFAULT_POST_CHARS_LIMIT = 500
export const DEFAULT_FONT_SIZE = '15px'

export const NIMBUS_PAGE_LIFECYCLE_FROZEN = 'nimbus-frozen'

export const STORAGE_KEY_DRAFTS = 'nimbus-drafts'
export const STORAGE_KEY_USERS = 'nimbus-users'
export const STORAGE_KEY_SERVERS = 'nimbus-servers'
export const STORAGE_KEY_NODES = 'nimbus-nodes'
export const STORAGE_KEY_CURRENT_USER_HANDLE = 'nimbus-current-user-handle'
export const STORAGE_KEY_NOTIFY_TAB = 'nimbus-notify-tab'
export const STORAGE_KEY_FIRST_VISIT = 'nimbus-first-visit'
export const STORAGE_KEY_SETTINGS = 'nimbus-settings'
export const STORAGE_KEY_CUSTOM_EMOJIS = 'nimbus-custom-emojis'
export const STORAGE_KEY_HIDE_EXPLORE_POSTS_TIPS = 'nimbus-hide-explore-posts-tips'
export const STORAGE_KEY_HIDE_EXPLORE_NEWS_TIPS = 'nimbus-hide-explore-news-tips'
export const STORAGE_KEY_HIDE_EXPLORE_TAGS_TIPS = 'nimbus-hide-explore-tags-tips'
export const STORAGE_KEY_NOTIFICATION = 'nimbus-notification'
export const STORAGE_KEY_NOTIFICATION_POLICY = 'nimbus-notification-policy'
export const STORAGE_KEY_PWA_HIDE_INSTALL = 'nimbus-pwa-hide-install'
export const STORAGE_KEY_LAST_ACCESSED_NOTIFICATION_ROUTE = 'nimbus-last-accessed-notification-route'
export const STORAGE_KEY_LAST_ACCESSED_EXPLORE_ROUTE = 'nimbus-last-accessed-explore-route'
export const STORAGE_KEY_BOTTOM_NAV_BUTTONS = 'nimbus-bottom-nav-buttons'

export const HANDLED_MASTO_URLS = /^(https?:\/\/)?([\w\-]+\.)+\w+\/(@[@\w\-.]+)(\/objects)?(\/\d+)?$/

export const NOTIFICATION_FILTER_TYPES: mastodon.v1.NotificationType[] = ['status', 'reblog', 'follow', 'follow_request', 'favourite', 'poll', 'update', 'admin.sign_up', 'admin.report']

export const THEME_COLORS = {
  defaultTheme: '#0097fd',
  themeDark: '#111111',
  themeLight: '#fafafa',
  backgroundDark: '#fafafa',
  backgroundLight: '#111111',
} as const
