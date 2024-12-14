<script setup lang="ts">
import type { ProfileView } from './types'

// Avatar with a background base achieving a 3px border to be used in status cards
// The border is used for Avatar on Avatar for reblogs and connecting replies

defineProps<{
  profile: ProfileView
  square?: boolean
}>()
</script>

<template>
  <div
    :key="profile.avatar"
    :style="{ 'clip-path': square ? `url(#avatar-mask)` : 'none' }"
    :class="{ 'rounded-full': !square }"
    bg-base w-54px h-54px
    flex items-center justify-center
  >
    <ProfileAvatar :profile w-48px h-48px :square="square" />
  </div>
</template>
