<script setup lang="ts">
import type { mastodon } from 'masto'
import { EditorContent } from '@tiptap/vue-3'
import stringLength from 'string-length'
import type { DraftItem } from '~/types'

const {
  threadComposer,
  draftKey,
  draftItemIndex,
  expanded = false,
  placeholder,
  dialogLabelledBy,
  initial = getDefaultDraftItem,
} = defineProps<{
  draftKey: string
  draftItemIndex: number
  initial?: () => DraftItem
  threadComposer?: ReturnType<typeof useThreadComposer>
  placeholder?: string
  inReplyToId?: string
  expanded?: boolean
  dialogLabelledBy?: string
}>()

const emit = defineEmits<{
  (evt: 'published', status: mastodon.v1.Status): void
}>()

const { t } = useI18n()

const { threadItems, threadIsActive, publishThread } = threadComposer ?? useThreadComposer(draftKey)

const draft = computed({
  get: () => threadItems.value[draftItemIndex],
  set: (updatedDraft: DraftItem) => {
    threadItems.value[draftItemIndex] = updatedDraft
  },
},
)

const isFinalItemOfThread = computed(() => draftItemIndex === threadItems.value.length - 1)

const {
  isExceedingAttachmentLimit,
  isUploading,
  failedAttachments,
  isOverDropZone,
  uploadAttachments,
  pickAttachments,
  setDescription,
  removeAttachment,
  dropZoneRef,
} = useUploadMediaAttachment(draft)

const { shouldExpanded, isExpanded, isSending, isPublishDisabled, publishDraft, failedMessages, preferredLanguage, publishSpoilerText } = usePublish(
  {
    draftItem: draft,
    ...{ expanded: toRef(() => expanded), isUploading, initialDraft: initial, isPartOfThread: false },
  },
)

const { editor } = useTiptap({
  content: computed({
    get: () => draft.value.params.status,
    set: (newVal) => {
      draft.value.params.status = newVal
      draft.value.lastUpdated = Date.now()
    },
  }),
  placeholder: computed(() => placeholder ?? draft.value.params.inReplyToId ? t('placeholder.replying') : t('placeholder.default_1')),
  autofocus: shouldExpanded.value,
  onSubmit: publish,
  onFocus() {
    if (!isExpanded && draft.value.initialText) {
      editor.value?.chain().insertContent(`${draft.value.initialText} `).focus('end').run()
      draft.value.initialText = ''
    }
    isExpanded.value = true
  },
  onPaste: handlePaste,
})

const characterCount = computed(() => {
  const text = htmlToText(editor.value?.getHTML() || '')

  let length = stringLength(text)

  // taken from https://github.com/mastodon/mastodon/blob/07f8b4d1b19f734d04e69daeb4c3421ef9767aac/app/lib/text_formatter.rb
  const linkRegex = /(https?:\/\/|xmpp:)\S+/g

  // taken from https://github.com/mastodon/mastodon/blob/af578e/app/javascript/mastodon/features/compose/util/counter.js
  const countableMentionRegex = /(^|[^/\w])@((\w+)@[a-z0-9.-]+[a-z0-9])/gi

  // maximum of 23 chars per link
  // https://github.com/elk-zone/elk/issues/1651
  const maxLength = 23

  for (const [fullMatch] of text.matchAll(linkRegex))
    length -= fullMatch.length - Math.min(maxLength, fullMatch.length)

  for (const [fullMatch, before, _handle, username] of text.matchAll(countableMentionRegex))
    length -= fullMatch.length - (before + username).length - 1 // - 1 for the @

  if (draft.value.mentions) {
    // + 1 is needed as mentions always need a space separator at the end
    length += draft.value.mentions.map((mention) => {
      const [handle] = mention.split('@')
      return `@${handle}`
    }).join(' ').length + 1
  }

  length += stringLength(publishSpoilerText.value)

  return length
})

const isExceedingCharacterLimit = computed(() => {
  return characterCount.value > characterLimit.value
})

const postLanguageDisplay = computed(() => languagesNameList.find(i => i.code === (draft.value.params.language || preferredLanguage.value))?.nativeName)

async function handlePaste(evt: ClipboardEvent) {
  const files = evt.clipboardData?.files
  if (!files || files.length === 0)
    return

  evt.preventDefault()
  await uploadAttachments(Array.from(files))
}

function insertEmoji(name: string) {
  editor.value?.chain().focus().insertEmoji(name).run()
}

async function toggleSensitive() {
  draft.value.params.sensitive = !draft.value.params.sensitive
}

async function publish() {
  const publishResult = await (threadIsActive.value ? publishThread() : publishDraft())
  if (publishResult) {
    if (Array.isArray(publishResult))
      failedMessages.value = publishResult
    else
      emit('published', publishResult)
  }
}

useWebShareTarget(async ({ data: { data, action } }: any) => {
  if (action !== 'compose-with-shared-data')
    return

  editor.value?.commands.focus('end')

  for (const text of data.textParts) {
    for (const line of text.split('\n')) {
      editor.value?.commands.insertContent({
        type: 'paragraph',
        content: [{ type: 'text', text: line }],
      })
    }
  }

  if (data.files.length !== 0)
    await uploadAttachments(data.files)
})

defineExpose({
  focusEditor: () => {
    editor.value?.commands?.focus?.()
  },
})

function stopQuestionMarkPropagation(e: KeyboardEvent) {
  if (e.key === '?')
    e.stopImmediatePropagation()
}
</script>

<template>
  <div v-if="isHydrated && currentUser" flex="~ col gap-4" py3 px2 sm:px4 aria-roledescription="publish-widget">
    <template v-if="draft.editingStatus">
      <div id="state-editing" text-secondary self-center>
        {{ $t('state.editing') }}
      </div>
    </template>
    <div flex gap-3 flex-1>
      <div>
        <NuxtLink self-start :to="getAccountRoute(currentUser.account)">
          <AccountBigAvatar :account="currentUser.account" square />
        </NuxtLink>
        <div v-if="!isFinalItemOfThread" w-full h-full flex mt--3px justify-center>
          <div w-1px border="x base" mb-6 />
        </div>
      </div>

      <div w-full>
        <div flex gap-3 flex-1>
          <!-- This `w-0` style is used to avoid overflow problems in flex layouts，so don't remove it unless you know what you're doing -->
          <div
            ref="dropZoneRef" flex w-0 flex-col gap-3 flex-1 border="2 dashed transparent"
            :class="[isSending ? 'pointer-events-none' : '', isOverDropZone ? '!border-primary' : '']"
          >
            <ContentMentionGroup v-if="draft.mentions?.length && shouldExpanded" replying>
              <button
                v-for="m, i of draft.mentions" :key="m" text-primary hover:color-red
                @click="draft.mentions?.splice(i, 1)"
              >
                {{ accountToShortHandle(m) }}
              </button>
            </ContentMentionGroup>

            <div v-if="draft.params.sensitive">
              <input
                v-model="publishSpoilerText" type="text" :placeholder="$t('placeholder.content_warning')" p2
                border-rounded w-full bg-transparent outline-none border="~ base"
              >
            </div>

            <CommonErrorMessage v-if="failedMessages.length > 0" described-by="publish-failed">
              <header id="publish-failed" flex justify-between>
                <div flex items-center gap-x-2 font-bold>
                  <div aria-hidden="true" i-ri:error-warning-fill />
                  <p>{{ $t('state.publish_failed') }}</p>
                </div>
                <CommonTooltip placement="bottom" :content="$t('action.clear_publish_failed')">
                  <button
                    flex rounded-4 p1 hover:bg-active cursor-pointer transition-100
                    :aria-label="$t('action.clear_publish_failed')" @click="failedMessages = []"
                  >
                    <span aria-hidden="true" w="1.75em" h="1.75em" i-ri:close-line />
                  </button>
                </CommonTooltip>
              </header>
              <ol ps-2 sm:ps-1>
                <li v-for="(error, i) in failedMessages" :key="i" flex="~ col sm:row" gap-y-1 sm:gap-x-2>
                  <strong>{{ i + 1 }}.</strong>
                  <span>{{ error }}</span>
                </li>
              </ol>
            </CommonErrorMessage>

            <div relative flex-1 flex flex-col :class="shouldExpanded ? 'min-h-30' : ''">
              <EditorContent
                :editor="editor" flex max-w-full
                :class="{
                  'md:max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-400px)] max-h-35 of-y-auto overscroll-contain': shouldExpanded,
                }"
                @keydown="stopQuestionMarkPropagation"
                @keydown.esc.prevent="editor?.commands.blur()"
              />
            </div>

            <div v-if="isUploading" flex gap-1 items-center text-sm p1 text-primary>
              <div animate-spin preserve-3d>
                <div i-ri:loader-2-fill />
              </div>
              {{ $t('state.uploading') }}
            </div>
            <CommonErrorMessage
              v-else-if="failedAttachments.length > 0"
              :described-by="isExceedingAttachmentLimit ? 'upload-failed uploads-per-post' : 'upload-failed'"
            >
              <header id="upload-failed" flex justify-between>
                <div flex items-center gap-x-2 font-bold>
                  <div aria-hidden="true" i-ri:error-warning-fill />
                  <p>{{ $t('state.upload_failed') }}</p>
                </div>
                <CommonTooltip placement="bottom" :content="$t('action.clear_upload_failed')">
                  <button
                    flex rounded-4 p1 hover:bg-active cursor-pointer transition-100
                    :aria-label="$t('action.clear_upload_failed')" @click="failedAttachments = []"
                  >
                    <span aria-hidden="true" w="1.75em" h="1.75em" i-ri:close-line />
                  </button>
                </CommonTooltip>
              </header>
              <div v-if="isExceedingAttachmentLimit" id="uploads-per-post" ps-2 sm:ps-1 text-small>
                {{ $t('state.attachments_exceed_server_limit') }}
              </div>
              <ol ps-2 sm:ps-1>
                <li v-for="error in failedAttachments" :key="error[0]" flex="~ col sm:row" gap-y-1 sm:gap-x-2>
                  <strong>{{ error[1] }}:</strong>
                  <span>{{ error[0] }}</span>
                </li>
              </ol>
            </CommonErrorMessage>

            <div v-if="draft.attachments.length" flex="~ col gap-2" overflow-auto>
              <PublishAttachment
                v-for="(att, idx) in draft.attachments" :key="att.id" :attachment="att"
                :dialog-labelled-by="dialogLabelledBy ?? (draft.editingStatus ? 'state-editing' : undefined)"
                @remove="removeAttachment(idx)" @set-description="setDescription(att, $event)"
              />
            </div>
          </div>
        </div>

        <div flex="~ col 1" max-w-full>
          <div v-if="shouldExpanded" flex="~ gap-1 1 wrap" m="s--1" pt-2 justify="end" max-w-full border="t base">
            <PublishEmojiPicker @select="insertEmoji">
              <button btn-action-icon :title="$t('tooltip.emojis')" :aria-label="$t('tooltip.add_emojis')">
                <div i-ri:emotion-line />
              </button>
            </PublishEmojiPicker>

            <CommonTooltip placement="top" :content="$t('tooltip.add_media')">
              <button btn-action-icon :aria-label="$t('tooltip.add_media')" @click="pickAttachments">
                <div i-ri:image-add-line />
              </button>
            </CommonTooltip>

            <PublishEditorTools v-if="editor" :editor="editor" />

            <div flex-auto />

            <PublishCharacterCounter :max="characterLimit" :length="characterCount" />

            <CommonTooltip placement="top" :content="$t('tooltip.change_language')">
              <CommonDropdown placement="bottom" auto-boundary-max-size>
                <button btn-action-icon :aria-label="$t('tooltip.change_language')" w-max mr1>
                  <span v-if="postLanguageDisplay" text-secondary text-sm ml1>{{ postLanguageDisplay }}</span>
                  <div v-else i-ri:translate-2 />
                  <div i-ri:arrow-down-s-line text-sm text-secondary me--1 />
                </button>

                <template #popper>
                  <PublishLanguagePicker v-model="draft.params.language" min-w-80 />
                </template>
              </CommonDropdown>
            </CommonTooltip>

            <CommonTooltip placement="top" :content="$t('tooltip.add_content_warning')">
              <button btn-action-icon :aria-label="$t('tooltip.add_content_warning')" @click="toggleSensitive">
                <div v-if="draft.params.sensitive" i-ri:alarm-warning-fill text-orange />
                <div v-else i-ri:alarm-warning-line />
              </button>
            </CommonTooltip>

            <PublishThreadTools :draft-item-index="draftItemIndex" :draft-key="draftKey" />

            <CommonTooltip
              v-if="failedMessages.length > 0" id="publish-failed-tooltip" placement="top"
              :content="$t('tooltip.publish_failed')"
            >
              <button
                btn-danger rounded-3 text-sm w-full flex="~ gap1" items-center md:w-fit
                aria-describedby="publish-failed-tooltip"
              >
                <span block>
                  <div block i-carbon:face-dizzy-filled />
                </span>
                <span>{{ $t('state.publish_failed') }}</span>
              </button>
            </CommonTooltip>

            <CommonTooltip
              v-else id="publish-tooltip" placement="top" :content="$t('tooltip.add_publishable_content')"
              :disabled="!(isPublishDisabled || isExceedingCharacterLimit)"
            >
              <button
                v-if="!threadIsActive || isFinalItemOfThread"
                btn-solid rounded-3 text-sm w-full flex="~ gap1" items-center md:w-fit class="publish-button"
                :aria-disabled="isPublishDisabled || isExceedingCharacterLimit" aria-describedby="publish-tooltip"
                @click="publish"
              >
                <span v-if="isSending" block animate-spin preserve-3d>
                  <div block i-ri:loader-2-fill />
                </span>
                <span v-if="failedMessages.length" block>
                  <div block i-carbon:face-dizzy-filled />
                </span>
                <template v-if="threadIsActive">
                  <span>{{ $t('action.publish_thread') }} </span>
                </template>
                <template v-else>
                  <span v-if="draft.editingStatus">{{ $t('action.save_changes') }}</span>
                  <span v-else-if="draft.params.inReplyToId">{{ $t('action.reply') }}</span>
                  <span v-else>{{ !isSending ? $t('action.publish') : $t('state.publishing') }}</span>
                </template>
              </button>
            </CommonTooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.publish-button[aria-disabled=true] {
  cursor: not-allowed;
  background-color: var(--c-bg-btn-disabled);
  color: var(--c-text-btn-disabled);
}

.publish-button[aria-disabled=true]:hover {
  background-color: var(--c-bg-btn-disabled);
  color: var(--c-text-btn-disabled);
}

.option-input:focus+.delete-button {
  display: none;
}

.option-input:not(:focus)+.delete-button+.char-limit-radial {
  display: none;
}

.char-limit-radial {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
}
</style>
