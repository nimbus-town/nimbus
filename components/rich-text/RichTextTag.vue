<script setup lang="ts">
defineProps<{
  tag: string
  text: string
}>()

// TODO reimplement dropdown with record author only tag / mute tag
</script>

<template>
  <CommonDropdown inline-flex>
    <button>{{ text }}</button>
    <template #popper>
      <NuxtLink :to="`/hashtag/${tag}`">
        <CommonDropdownItem
          :text="`See ${tag} posts`"
          icon="i-ri:search-line"
        />
      </NuxtLink>
      <NuxtLink :to="`/hashtag/${tag}`">
        <CommonDropdownItem
          :text="`See ${tag} posts by user`"
          icon="i-ri:user-line"
        />
      </NuxtLink>
      <CommonDropdownItem
        :text="`Mute ${tag}`"
        icon="i-ri:eye-off-line"
      />
    </template>
  </CommonDropdown>
</template>
