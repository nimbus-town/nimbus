<script setup lang="ts">
defineProps<{
  text: string
  uri: string
}>()
</script>

<template>
  <NuxtLink :href="uri" external>
    {{ text }}
  </NuxtLink>
</template>
