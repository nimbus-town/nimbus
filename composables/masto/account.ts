import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import type { mastodon } from 'masto'

// TODO: remove once mastondon support was replaced
export type Account = mastodon.v1.Account | ProfileViewDetailed

export function isBsykAccount(account: Account): account is ProfileViewDetailed {
  return !!(account as ProfileViewDetailed).did
}

export function getDisplayName(account: Account, options?: { rich?: boolean }) {
  if (isBsykAccount(account))
    return account.displayName

  const displayName = account.displayName || account.username || account.acct || ''
  if (options?.rich)
    return displayName
  return displayName.replace(/:([\w-]+):/g, '')
}

export function accountToShortHandle(acct: string) {
  return `@${acct.includes('@') ? acct.split('@')[0] : acct}`
}

export function getShortHandle(account: Account) {
  if (isBsykAccount(account))
    return account.handle

  if (!account.acct)
    return ''
  return accountToShortHandle(account.acct)
}

export function getServerName(account: Account) {
  if (isBsykAccount(account))
    return ''

  if (account.acct?.includes('@'))
    return account.acct.split('@')[1]
  // We should only lack the server name if we're on the same server as the account
  return currentInstance.value ? getInstanceDomain(currentInstance.value) : ''
}

export function getFullHandle(account: Account) {
  if (isBsykAccount(account))
    return account.handle

  const handle = `@${account.acct}`
  if (!currentUser.value || account.acct.includes('@'))
    return handle
  return `${handle}@${getServerName(account)}`
}

export function toShortHandle(fullHandle: string) {
  if (!currentUser.value)
    return fullHandle
  const server = currentUser.value.server
  if (fullHandle.endsWith(`@${server}`))
    return fullHandle.slice(0, -server.length - 1)
  return fullHandle
}

export function extractAccountHandle(account: Account) {
  if (isBsykAccount(account))
    return account.handle

  let handle = getFullHandle(account).slice(1)
  const uri = currentInstance.value ? getInstanceDomain(currentInstance.value) : currentServer.value
  if (currentInstance.value && handle.endsWith(`@${uri}`))
    handle = handle.slice(0, -uri.length - 1)

  return handle
}

export function useAccountHandle(account: mastodon.v1.Account, fullServer = true) {
  return computed(() => fullServer
    ? getFullHandle(account)
    : getShortHandle(account),
  )
}
