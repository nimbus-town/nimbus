import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import type { MaybeRefOrGetter, RemovableRef } from '@vueuse/core'
import type { mastodon } from 'masto'
import type { EffectScope, Ref } from 'vue'
import { XRPC } from '@atcute/client'
import { configureOAuth, createAuthorizationUrl, deleteStoredSession, finalizeAuthorization, getSession, OAuthUserAgent, resolveFromIdentity, type Session } from '@atcute/oauth-browser-client'
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

const oauthInitialized = ref(false)
const users: Ref<UserLogin[]> | RemovableRef<UserLogin[]> = import.meta.server ? ref<UserLogin[]>([]) : ref<UserLogin[]>([]) as RemovableRef<UserLogin[]>
export const currentUserDid = useLocalStorage<`did:${string}`>(STORAGE_KEY_CURRENT_USER_HANDLE, mock ? mock.user.account.id : '')
const currentSession = ref<Session | null>(null)

// TODO: remove
export const instanceStorage = useLocalStorage<Record<string, mastodon.v1.Instance>>(STORAGE_KEY_SERVERS, mock ? mock.server : {}, { deep: true })
const nodes = useLocalStorage<Record<string, any>>(STORAGE_KEY_NODES, {}, { deep: true })

export type ElkInstance = Partial<mastodon.v1.Instance> & {
  uri: string
  /** support GoToSocial */
  accountDomain?: string | null
}
export function getInstanceCache(server: string): mastodon.v1.Instance | undefined {
  return instanceStorage.value[server]
}

export const currentUser = computed<UserLogin | undefined>(() => {
  const did = currentUserDid.value
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

function getClient(session = currentSession.value) {
  if (!session)
    throw new Error('No session found')

  const _session = session

  const agent = new OAuthUserAgent(session)
  const client = new XRPC({ handler: agent })

  // TODO: this should be done in the tsky client
  async function getProfile(): Promise<ProfileViewDetailed> {
    const response = await client.get('app.bsky.actor.getProfile' as any, {
      params: {
        actor: _session.info.sub,
      },
    }) as any

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

  return {
    client,
    getProfile,
  }
}

export const characterLimit = computed(() => currentInstance.value?.configuration?.statuses.maxCharacters ?? DEFAULT_POST_CHARS_LIMIT)

export async function loginTo(
  masto: ElkMasto,
  user: Overwrite<UserLogin, { account?: mastodon.v1.AccountCredentials }>,
) {
  // TODO: remove mastodon code
  mastoLogin(masto, { server: publicServer.value })

  if (user.did && currentUserDid.value !== user.did) {
    currentSession.value = await getSession(user.did, { allowStale: true })
    currentUserDid.value = user.did
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
  const account = await getClient().getProfile()
  currentUser.value!.account = account
  return account
}

export async function removePushNotificationData(user: UserLogin, fromSWPushManager = true) {
  // clear push subscription
  user.pushSubscription = undefined
  const { did } = user.account
  // clear request notification permission
  delete useLocalStorage<PushNotificationRequest>(STORAGE_KEY_NOTIFICATION, {}).value[did]
  // clear push notification policy
  delete useLocalStorage<PushNotificationPolicy>(STORAGE_KEY_NOTIFICATION_POLICY, {}).value[did]

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
  await loginTo(useMasto(), user)

  // This only cleans up the URL; page content should stay the same
  const route = useRoute()
  const router = useRouter()
  if ('server' in route.params && user?.did && !useNuxtApp()._processingMiddleware) {
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

  const _currentUserDid = currentUser.value.did

  const index = users.value.findIndex(u => u.account?.did === _currentUserDid)

  if (index !== -1) {
    // Clear stale data
    clearUserLocalStorage()

    await removePushNotifications(currentUser.value)

    await removePushNotificationData(currentUser.value)

    try {
      const session = await getSession(_currentUserDid, { allowStale: true })
      const agent = new OAuthUserAgent(session)
      await agent.signOut()
    }
    catch (err) {
      console.error('Failed to sign out', err)
      // `signOut` also deletes the session, we only serve as fallback if it fails.
      deleteStoredSession(_currentUserDid)
    }

    // Remove the current user from the users
    users.value.splice(index, 1)
  }

  // Set currentUserId to next user if available
  currentUserDid.value = users.value[0]?.did

  if (!currentUserDid.value)
    await useRouter().push('/')

  await loginTo(currentUserDid.value)
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
        const did = currentUser.value?.did ?? '[anonymous]'

        // Backward compatibility, respect webDomain in acct
        // In previous versions, acct was username@server instead of username@webDomain
        // for example: elk@m.webtoo.ls instead of elk@webtoo.ls
        if (!all.value[did]) {
          const [username, webDomain] = did.split('@')
          const server = currentServer.value
          if (webDomain && server && server !== webDomain) {
            const oldId = `${username}@${server}`
            const outdatedSettings = all.value[oldId]
            if (outdatedSettings) {
              const newAllValue = { ...all.value, [did]: outdatedSettings }
              delete newAllValue[oldId]
              all.value = newAllValue
            }
          }
          all.value[did] = Object.assign(initial(), all.value[did] || {})
        }
        return all.value[did]
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

export function useAuth() {
  function setUser(user: UserLogin) {
    const userIndex = users.value.findIndex(u => u.account.did === user.account.did)
    if (userIndex !== -1)
      users.value.splice(userIndex, 1, user)
    else
      users.value.push(user)
  }

  // TODO: should be part of tsky

  async function callback() {
    const params = new URLSearchParams(location.hash.slice(1))

    // We've captured the search params, we don't want this to be replayed.
    // Do this on global history instance so it doesn't affect this page rendering.
    history.replaceState(null, '', '/')

    const session = await finalizeAuthorization(params)

    const client = getClient(session)

    setUser({
      did: session.info.sub,
      account: await client.getProfile(),
      server: '', // TODO: get the server from the session
    })

    currentSession.value = session
    currentUserDid.value = session.info.sub

    // TODO: redirect to the original URL if there was one
  }

  async function init() {
    oauthInitialized.value = true

    const isLocalDev = typeof window !== 'undefined' && isLoopbackHost(window.location.hostname)

    let clientId = `${window.location.protocol}//${window.location.host}/api/oauth/client-metadata.json`

    if (isLocalDev) {
      const redirectUri = new URL(
        `http://127.0.0.1${
          window.location.port ? `:${window.location.port}` : ''
        }/oauth/callback`,
      ).href

      clientId = `http://localhost?${new URLSearchParams({
        scope: OAUTH_SCOPE,
        redirect_uri: redirectUri,
      })}`

      configureOAuth({
        metadata: {
          client_id: clientId,
          redirect_uri: redirectUri,
        },
      })
    }
    else {
      configureOAuth({
        metadata: {
          client_id: clientId,
          redirect_uri: `${window.location.origin}/oauth/callback`,
        },
      })
    }

    // load the current user session from storage
    if (currentUserDid.value) {
      currentSession.value = await getSession(currentUserDid.value, { allowStale: true })
    }

    // TODO: remove after testing
    // eslint-disable-next-line no-console
    console.log('OAuth client initialized')
  }

  async function signIn(handle: string) {
    const { identity, metadata } = await resolveFromIdentity(handle)

    // passing `identity` is optional,
    // it allows for the login form to be autofilled with the user's handle or DID
    const authUrl = await createAuthorizationUrl({
      metadata,
      identity,
      scope: OAUTH_SCOPE,
    })

    // recommended to wait for the browser to persist local storage before proceeding
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await sleep(200)

    // redirect the user to sign in and authorize the app
    window.location.assign(authUrl)

    // if this is on an async function, ideally the function should never ever resolve.
    // the only way it should resolve at this point is if the user aborted the authorization
    // by returning back to this page (thanks to back-forward page caching)
    await new Promise((_resolve, reject) => {
      const listener = () => {
        reject(new Error(`user aborted the login request`))
      }

      window.addEventListener('pageshow', listener, { once: true })
    })
  }

  // auto-init
  if (!oauthInitialized.value && import.meta.client) {
    // eslint-disable-next-line no-console
    console.log('Initializing OAuth client')
    init()
  }

  return {
    users,
    callback,
    signIn,
  }
}

// auto load
useAuth()
