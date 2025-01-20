<script setup lang="ts">
defineProps<{
  text: string
  did: string
}>()

// TODO async loaded profile hovercard
</script>

<template>
  <NuxtLink :to="`/profile/${did}`">
    {{ text }}
  </NuxtLink>
</template>
