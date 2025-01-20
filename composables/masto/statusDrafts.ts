import type { mastodon } from 'masto'
import type { ComputedRef, Ref } from 'vue'
import { STORAGE_KEY_DRAFTS } from '~/constants'
import type { DraftItem, DraftMap } from '~/types'
import type { Mutable } from '~/types/utils'

export const currentUserDrafts = (import.meta.server || process.test)
  ? computed<DraftMap>(() => ({}))
  : useUserLocalStorage<DraftMap>(STORAGE_KEY_DRAFTS, () => ({}))

export const builtinDraftKeys = [
  'dialog',
  'home',
]

export function getDefaultDraftItem(options: Partial<Mutable<mastodon.rest.v1.CreateStatusParams> & Omit<DraftItem, 'params'>> = {}): DraftItem {
  const {
    attachments = [],
    initialText = '',
    status,
    inReplyToId,
    sensitive,
    spoilerText,
    language,
    mentions,
  } = options

  return {
    attachments,
    initialText,
    params: {
      status: status || '',
      inReplyToId,
      sensitive: sensitive ?? false,
      spoilerText: spoilerText || '',
      language: language || '', // auto inferred from current language on posting
    },
    mentions,
    lastUpdated: Date.now(),
  }
}

export async function getDraftFromStatus(status: mastodon.v1.Status): Promise<DraftItem> {
  const info = {
    status: await convertMastodonHTML(status.content),
    attachments: status.mediaAttachments,
    sensitive: status.sensitive,
    spoilerText: status.spoilerText,
    language: status.language,
    inReplyToId: status.inReplyToId,
  }

  return getDefaultDraftItem((status.mediaAttachments !== undefined && status.mediaAttachments.length > 0)
    ? { ...info, mediaIds: status.mediaAttachments.map(att => att.id) }
    : { ...info })
}

function getAccountsToMention(status: mastodon.v1.Status) {
  const userId = currentUser.value?.account.id
  const accountsToMention = new Set<string>()
  if (status.account.id !== userId)
    accountsToMention.add(status.account.acct)
  status.mentions
    .filter(mention => mention.id !== userId)
    .map(mention => mention.acct)
    .forEach(i => accountsToMention.add(i))
  return Array.from(accountsToMention)
}

export function getReplyDraft(status: mastodon.v1.Status) {
  const accountsToMention = getAccountsToMention(status)
  return {
    key: `reply-${status.id}`,
    draft: () => {
      return getDefaultDraftItem({
        initialText: '',
        inReplyToId: status!.id,
        sensitive: status.sensitive,
        spoilerText: status.spoilerText,
        mentions: accountsToMention,
        language: status.language,
      })
    },
  }
}

export function isEmptyDraft(drafts: Array<DraftItem> | DraftItem | null | undefined) {
  if (!drafts)
    return true

  const draftsArray: Array<DraftItem> = Array.isArray(drafts) ? drafts : [drafts]

  if (draftsArray.length === 0)
    return true

  const anyDraftHasContent = draftsArray.some((draft) => {
    const { params, attachments } = draft
    const status = params.status ?? ''
    const text = htmlToText(status).trim().replace(/^(@\S+\s?)+/, '').replaceAll(/```/g, '').trim()

    return (text.length > 0)
      || (attachments.length > 0)
  })

  return !anyDraftHasContent
}

export interface UseDraft {
  draftItems: Ref<Array<DraftItem>>
  isEmpty: ComputedRef<boolean> | Ref<boolean>
}

export function useDraft(
  draftKey: string,
  initial: () => DraftItem = () => getDefaultDraftItem({}),
): UseDraft {
  const draftItems = computed({
    get() {
      if (!currentUserDrafts.value[draftKey])
        currentUserDrafts.value[draftKey] = [initial()]
      const drafts = currentUserDrafts.value[draftKey]
      if (Array.isArray(drafts))
        return drafts
      return [drafts]
    },
    set(val) {
      currentUserDrafts.value[draftKey] = val
    },
  })

  const isEmpty = computed(() => isEmptyDraft(draftItems.value))

  onUnmounted(async () => {
    // Remove draft if it's empty
    if (isEmpty.value && draftKey) {
      await nextTick()
      delete currentUserDrafts.value[draftKey]
    }
  })

  return { draftItems, isEmpty }
}

export function mentionUser(account: mastodon.v1.Account) {
  openPublishDialog('dialog', getDefaultDraftItem({
    status: `@${account.acct} `,
  }))
}

export function directMessageUser(account: mastodon.v1.Account) {
  openPublishDialog('dialog', getDefaultDraftItem({ status: `@${account.acct} ` }))
}

export function clearEmptyDrafts() {
  for (const key in currentUserDrafts.value) {
    if (builtinDraftKeys.includes(key) && !isEmptyDraft(currentUserDrafts.value[key]))
      continue
    if (isEmptyDraft(currentUserDrafts.value[key]))
      delete currentUserDrafts.value[key]
  }
}
