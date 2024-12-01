<script setup lang="ts">
import type { ProfileView } from './types'

defineProps<{
  profile: ProfileView
  square?: boolean
  big?: boolean
}>()

const defaultAvatar = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const loaded = ref(false)
const error = ref(false)
</script>

<template>
  <img
    :key="profile.avatar"
    :src="(error || !loaded) ? defaultAvatar : profile.avatar"
    :alt="$t('account.avatar_description', [profile.displayName ?? profile.handle])"
    :class="[
      loaded ? 'bg-base' : 'bg-gray:10',
      square ? '' : 'rounded-full',
    ]"
    :style="{ 'clip-path': square ? `url(#avatar-mask)` : 'none' }"
    loading="lazy"
    width="400"
    height="400"
    select-none
    @load="loaded = true"
    @error="error = true"
  >
</template>
