<script setup lang="ts">
const auth = useAuth()

onMounted(async () => {
  if (!import.meta.client)
    return

  await auth.callback()
  navigateTo('/')
})
</script>

<template>
  <div />
</template>
