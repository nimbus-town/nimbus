<script setup lang="ts">
const router = useRouter()
const route = useRoute()

onMounted(async () => {
  // TODO: login check
  await openPublishDialog('intent', getDefaultDraftItem({
    status: route.query.text as string,
    sensitive: route.query.sensitive === 'true' || route.query.sensitive === null,
    spoilerText: route.query.spoiler_text as string,
    language: route.query.language as string,
  }), true)
  // TODO: need a better idea 👀
  await router.replace('/home')
})
</script>

<template>
  <div>
    <slot />
  </div>
</template>
