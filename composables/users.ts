import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import type { BrowserOAuthClient, OAuthSession } from '@atproto/oauth-client-browser'
import type { MaybeRefOrGetter, RemovableRef } from '@vueuse/core'
import type { mastodon } from 'masto'
import type { EffectScope, Ref } from 'vue'
import type { ElkMasto } from './masto/masto'
import { Agent } from '@atproto/api'
import { withoutProtocol } from 'ufo'
import type { PushNotificationPolicy, PushNotificationRequest } from '~/composables/push-notifications/types'
import {
  DEFAULT_POST_CHARS_LIMIT,
  OAUTH_SCOPE,
  STORAGE_KEY_CURRENT_USER_HANDLE,
  STORAGE_KEY_NODES,
  STORAGE_KEY_NOTIFICATION,
  STORAGE_KEY_NOTIFICATION_POLICY,
  STORAGE_KEY_SERVERS,
} from '~/constants'
import type { UserLogin } from '~/types'
import type { Overwrite } from '~/types/utils'

const mock = process.mock

const client = ref<BrowserOAuthClient>()
const isLoading = ref(false)
const users: Ref<UserLogin[]> | RemovableRef<UserLogin[]> = import.meta.server ? ref<UserLogin[]>([]) : ref<UserLogin[]>([]) as RemovableRef<UserLogin[]>
const sessions = ref<OAuthSession[]>([])
export const currentUserHandle = useLocalStorage<string>(STORAGE_KEY_CURRENT_USER_HANDLE, mock ? mock.user.account.id : '')
const nodes = useLocalStorage<Record<string, any>>(STORAGE_KEY_NODES, {}, { deep: true })
export const instanceStorage = useLocalStorage<Record<string, mastodon.v1.Instance>>(STORAGE_KEY_SERVERS, mock ? mock.server : {}, { deep: true })

export type ElkInstance = Partial<mastodon.v1.Instance> & {
  uri: string
  /** support GoToSocial */
  accountDomain?: string | null
}
export function getInstanceCache(server: string): mastodon.v1.Instance | undefined {
  return instanceStorage.value[server]
}

export const currentUser = computed<UserLogin | undefined>(() => {
  const did = currentUserHandle.value
  const currentUsers = users.value
  if (did) {
    const user = currentUsers.find(user => user.account.did === did)
    if (user)
      return user
  }
  // Fallback to the first account
  return currentUsers.length ? currentUsers[0] : undefined
})

const publicInstance = ref<ElkInstance | null>(null)
export const currentInstance = computed<null | ElkInstance>(() => {
  const instance = publicInstance.value
  return instance
})

export function getInstanceDomain(instance: ElkInstance) {
  return instance.accountDomain || withoutProtocol(instance.uri)
}

export const publicServer = ref('')
export const currentServer = computed<string>(() => publicServer.value)

export const currentNodeInfo = computed<null | Record<string, any>>(() => nodes.value[currentServer.value] || null)
export const isGotoSocial = computed(() => currentNodeInfo.value?.software?.name === 'gotosocial')
export const isGlitchEdition = computed(() => currentInstance.value?.version?.includes('+glitch'))

export function useUsers() {
  return users
}
export function useSelfAccount(user: MaybeRefOrGetter<mastodon.v1.Account | undefined>) {
  return computed(() => currentUser.value && resolveUnref(user)?.id === currentUser.value.account.id)
}

export const characterLimit = computed(() => currentInstance.value?.configuration?.statuses.maxCharacters ?? DEFAULT_POST_CHARS_LIMIT)

export async function loginTo(
  _masto: ElkMasto,
  user: Overwrite<UserLogin, { account?: ProfileViewDetailed }>,
) {
  if (currentUserHandle.value !== user.account?.did) {
    const session = await client.value?.restore(user.did)
    if (session) {
      sessions.value.push(session)
      currentUserHandle.value = user.account?.did
    }
    else {
      // remove session if it's not found
      sessions.value.splice(sessions.value.findIndex(s => s.did === user.did), 1)
      users.value.splice(users.value.findIndex(u => u.did === user.did), 1)
    }
  }
}

const accountPreferencesMap = new Map<string, Partial<mastodon.v1.Preference>>()

/**
 * @param account
 * @returns `true` when user ticked the preference to always expand posts with content warnings
 */
export function getExpandSpoilersByDefault(account: mastodon.v1.AccountCredentials) {
  return accountPreferencesMap.get(account.acct)?.['reading:expand:spoilers'] ?? false
}

/**
 * @param account
 * @returns `true` when user selected "Always show media" as Media Display preference
 */
export function getExpandMediaByDefault(account: mastodon.v1.AccountCredentials) {
  return accountPreferencesMap.get(account.acct)?.['reading:expand:media'] === 'show_all'
}

/**
 * @param account
 * @returns `true` when user selected "Always hide media" as Media Display preference
 */
export function getHideMediaByDefault(account: mastodon.v1.AccountCredentials) {
  return accountPreferencesMap.get(account.acct)?.['reading:expand:media'] === 'hide_all'
}

export async function fetchAccountInfo(client: mastodon.rest.Client, server: string) {
  // Try to fetch user preferences if the backend supports it.
  const fetchPrefs = async (): Promise<Partial<mastodon.v1.Preference>> => {
    try {
      return await client.v1.preferences.fetch()
    }
    catch (e) {
      console.warn(`Cannot fetch preferences: ${e}`)
      return {}
    }
  }

  const [account, preferences] = await Promise.all([
    client.v1.accounts.verifyCredentials(),
    fetchPrefs(),
  ])

  if (!account.acct.includes('@')) {
    const webDomain = getInstanceDomainFromServer(server)
    account.acct = `${account.acct}@${webDomain}`
  }

  // TODO: lazy load preferences
  accountPreferencesMap.set(account.acct, preferences)

  cacheAccount(account, server, true)
  return account
}

export function getInstanceDomainFromServer(server: string) {
  const instance = getInstanceCache(server)
  const webDomain = instance ? getInstanceDomain(instance) : server
  return webDomain
}

export async function refreshAccountInfo() {
  const account = await fetchAccountInfo(useMastoClient(), currentServer.value)
  currentUser.value!.account = account
  return account
}

export async function removePushNotificationData(user: UserLogin, fromSWPushManager = true) {
  // clear push subscription
  user.pushSubscription = undefined
  const { acct } = user.account
  // clear request notification permission
  delete useLocalStorage<PushNotificationRequest>(STORAGE_KEY_NOTIFICATION, {}).value[acct]
  // clear push notification policy
  delete useLocalStorage<PushNotificationPolicy>(STORAGE_KEY_NOTIFICATION_POLICY, {}).value[acct]

  const pwaEnabled = useAppConfig().pwaEnabled
  const pwa = useNuxtApp().$pwa
  const registrationError = pwa?.registrationError === true
  const unregister = pwaEnabled && !registrationError && pwa?.registrationError === true && fromSWPushManager

  // we remove the sw push manager if required and there are no more accounts with subscriptions
  if (unregister && (users.value.length === 0 || users.value.every(u => !u.pushSubscription))) {
    // clear sw push subscription
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription)
        await subscription.unsubscribe()
    }
    catch {
      // just ignore
    }
  }
}

export async function removePushNotifications(user: UserLogin) {
  if (!user.pushSubscription)
    return

  // unsubscribe push notifications
  await useMastoClient().v1.push.subscription.remove().catch(() => Promise.resolve())
}

export async function switchUser(user: UserLogin) {
  const masto = useMasto()

  await loginTo(masto, user)

  // This only cleans up the URL; page content should stay the same
  const route = useRoute()
  const router = useRouter()
  if ('server' in route.params && user?.token && !useNuxtApp()._processingMiddleware) {
    await router.push({
      ...route,
      force: true,
    })
  }
}

export async function signOut() {
  // TODO: confirm
  if (!currentUser.value)
    return

  const masto = useMasto()

  const _currentUserDid = currentUser.value.account.did

  const index = users.value.findIndex(u => u.account?.did === _currentUserDid)

  if (index !== -1) {
    // Clear stale data
    clearUserLocalStorage()
    if (!users.value.some((u, i) => u.server === currentUser.value!.server && i !== index))
      delete instanceStorage.value[currentUser.value.server]

    await removePushNotifications(currentUser.value)

    await removePushNotificationData(currentUser.value)

    currentUserHandle.value = ''
    // Remove the current user from the users
    users.value.splice(index, 1)
  }

  // Set currentUserId to next user if available
  currentUserHandle.value = users.value[0]?.account?.did

  if (!currentUserHandle.value)
    await useRouter().push('/')

  await loginTo(masto, currentUser.value || { server: publicServer.value })
}

export function checkLogin() {
  if (!currentUser.value) {
    openSigninDialog()
    return false
  }
  return true
}

interface UseUserLocalStorageCache {
  scope: EffectScope
  value: Ref<Record<string, any>>
}

/**
 * Create reactive storage for the current user
 * @param key
 * @param initial
 */
export function useUserLocalStorage<T extends object>(key: string, initial: () => T): Ref<T> {
  if (import.meta.server || process.test)
    return shallowRef(initial())

  // @ts-expect-error bind value to the function
  const map: Map<string, UseUserLocalStorageCache> = useUserLocalStorage._ = useUserLocalStorage._ || new Map()

  if (!map.has(key)) {
    const scope = effectScope(true)
    const value = scope.run(() => {
      const all = useLocalStorage<Record<string, T>>(key, {}, { deep: true })

      return computed(() => {
        const id = currentUser.value?.account.id
          ? currentUser.value.account.acct
          : '[anonymous]'

        // Backward compatibility, respect webDomain in acct
        // In previous versions, acct was username@server instead of username@webDomain
        // for example: elk@m.webtoo.ls instead of elk@webtoo.ls
        if (!all.value[id]) {
          const [username, webDomain] = id.split('@')
          const server = currentServer.value
          if (webDomain && server && server !== webDomain) {
            const oldId = `${username}@${server}`
            const outdatedSettings = all.value[oldId]
            if (outdatedSettings) {
              const newAllValue = { ...all.value, [id]: outdatedSettings }
              delete newAllValue[oldId]
              all.value = newAllValue
            }
          }
          all.value[id] = Object.assign(initial(), all.value[id] || {})
        }
        return all.value[id]
      })
    })
    map.set(key, { scope, value: value! })
  }

  return map.get(key)!.value as Ref<T>
}

/**
 * Clear all storages for the given account
 * @param account
 */
export function clearUserLocalStorage(account?: ProfileViewDetailed) {
  if (!account)
    account = currentUser.value?.account
  if (!account)
    return

  const id = `${account.acct}@${currentInstance.value ? getInstanceDomain(currentInstance.value) : currentServer.value}`

  // @ts-expect-error bind value to the function
  const cacheMap = useUserLocalStorage._ as Map<string, UseUserLocalStorageCache> | undefined
  cacheMap?.forEach(({ value }) => {
    if (value.value[id])
      delete value.value[id]
  })
}

function isLoopbackHost(host: string) {
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
}

async function loadOAuthClient(): Promise<BrowserOAuthClient> {
  const isLocalDev = typeof window !== 'undefined' && isLoopbackHost(window.location.hostname)

  let clientId = `${window.location.protocol}//${window.location.host}/api/oauth/client-metadata.json`

  if (isLocalDev) {
    const redirectUri = new URL(
      `http://127.0.0.1${
        window.location.port ? `:${window.location.port}` : ''
      }`,
    ).href

    clientId = `http://localhost?${new URLSearchParams({
      scope: OAUTH_SCOPE,
      redirect_uri: redirectUri,
    })}`
  }

  // import dynamically to avoid SSR issues
  const { BrowserOAuthClient } = await import('@atproto/oauth-client-browser')

  const client = await BrowserOAuthClient.load({
    clientId,
    handleResolver: 'https://api.bsky.app',
    plcDirectoryUrl: 'https://plc.directory',
  })

  return client
}

export function useAuth() {
  function getSession(did: string): OAuthSession {
    const session = sessions.value.find(s => s.did === did)
    if (!session)
      throw new Error('Session not found')
    return session as OAuthSession
  }

  function getAgent(sessionOrDid: string | OAuthSession) {
    const session = typeof sessionOrDid === 'string' ? getSession(sessionOrDid) : sessionOrDid
    return new Agent(session)
  }

  function setUser(user: UserLogin) {
    const userIndex = users.value.findIndex(u => u.account.did === user.account.did)
    if (userIndex !== -1)
      users.value.splice(userIndex, 1, user)
    else
      users.value.push(user)
  }

  async function getProfile(session: OAuthSession): Promise<ProfileViewDetailed> {
    const agent = getAgent(session)
    const response = await agent.getProfile({ actor: session.did })
    return {
      did: response.data.did,
      displayName: response.data.displayName,
      handle: response.data.handle,
      avatar: response.data.avatar,
      banner: response.data.banner,
      description: response.data.description,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt,
      postsCount: response.data.postsCount,
      followersCount: response.data.followersCount,
      followsCount: response.data.followsCount,
      indexedAt: response.data.indexedAt,
      labels: response.data.labels,
    }
  }

  async function init() {
    isLoading.value = true
    client.value = await loadOAuthClient()
    const result = await client.value.init()

    // TODO: remove after testing
    // eslint-disable-next-line no-console
    console.log('OAuth client initialized', result)

    if (result) {
      setUser({
        did: result.session.did as string,
        server: '', // TODO: get the server from the session
        account: await getProfile(result.session),
      })
      currentUserHandle.value = result.session.did
      // TODO: redirect to the original URL if there was one
    }

    // TODO: handle session events
    // client.value.addEventListener('updated', async (e) => {
    // })
    client.value.addEventListener('deleted', async (e) => {
      users.value = users.value.filter(u => u.did !== e.detail.sub)
      if (currentUserHandle.value === e.detail.sub)
        currentUserHandle.value = undefined
    })
    isLoading.value = false
  }

  async function signIn(handle: string) {
    const userSettings = useUserSettings()
    await client.value?.signIn(handle, {
      scope: OAUTH_SCOPE,
      // prompt: users.value.length > 0 ? 'select_account' : 'login',
      ui_locales: userSettings.value.language,
    })
  }

  // auto-init
  if (!client.value && import.meta.client) {
    init()
  }

  return {
    users,
    signIn,
  }
}
