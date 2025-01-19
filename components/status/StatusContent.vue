<script setup lang="ts">
import type { mastodon } from 'masto'

const { status, context } = defineProps<{
  status: mastodon.v1.Status
  newer?: mastodon.v1.Status
  context?: mastodon.v2.FilterContext | 'details'
  isPreview?: boolean
  inNotification?: boolean
}>()

const isDetails = computed(() => context === 'details')

// Content Filter logic
const filterResult = computed(() => status.filtered?.length ? status.filtered[0] : null)
const filter = computed(() => filterResult.value?.filter)

const filterPhrase = computed(() => filter.value?.title)
const isFiltered = computed(() => status.account.id !== currentUser.value?.account.id && filterPhrase && context && context !== 'details' && !!filter.value?.context.includes(context))

// check spoiler text or media attachment
// needed to handle accounts that mark all their posts as sensitive
const spoilerTextPresent = computed(() => !!status.spoilerText && status.spoilerText.trim().length > 0)
const hasSpoilerOrSensitiveMedia = computed(() => spoilerTextPresent.value || (status.sensitive && !!status.mediaAttachments.length))
const isSensitiveNonSpoiler = computed(() => status.sensitive && !status.spoilerText && !!status.mediaAttachments.length)
const hideAllMedia = computed(
  () => {
    return currentUser.value ? (getHideMediaByDefault(currentUser.value.account) && (!!status.mediaAttachments.length || !!status.card?.html)) : false
  },
)
const embeddedMediaPreference = usePreferences('experimentalEmbeddedMedia')
const allowEmbeddedMedia = computed(() => status.card?.html && embeddedMediaPreference.value)
</script>

<template>
  <div space-y-3>
    <StatusBody v-if="(!isFiltered && isSensitiveNonSpoiler) || hideAllMedia" :status="status" :newer="newer" :with-action="!isDetails" :class="isDetails ? 'text-xl' : ''" />
    <StatusSpoiler :enabled="hasSpoilerOrSensitiveMedia || isFiltered" :filter="isFiltered" :sensitive-non-spoiler="isSensitiveNonSpoiler || hideAllMedia">
      <template v-if="spoilerTextPresent" #spoiler>
        <p>
          <ContentRich :content="status.spoilerText" :emojis="status.emojis" :markdown="false" />
        </p>
      </template>
      <template v-else-if="filterPhrase" #spoiler>
        <p>{{ `${$t('status.filter_hidden_phrase')}: ${filterPhrase}` }}</p>
      </template>
      <StatusBody v-if="!(isSensitiveNonSpoiler || hideAllMedia)" :status="status" :newer="newer" :with-action="!isDetails" :class="isDetails ? 'text-xl' : ''" />
      <StatusTranslation :status="status" />
      <StatusMedia
        v-if="status.mediaAttachments?.length"
        :status="status"
        :is-preview="isPreview"
      />
      <StatusPreviewCard
        v-if="status.card && !allowEmbeddedMedia"
        :card="status.card"
        :small-picture-only="status.mediaAttachments?.length > 0"
      />
      <StatusEmbeddedMedia v-if="allowEmbeddedMedia" :status="status" />
      <StatusCard
        v-if="status.reblog"
        :status="status.reblog" border="~ rounded"
        :actions="false"
      />
    </StatusSpoiler>
  </div>
</template>
