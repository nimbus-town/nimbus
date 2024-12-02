<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  alias: ['/signin/callback'],
})

const route = useRoute()
const router = useRouter()
if (import.meta.client && route.path === '/signin/callback')
  router.push('/home')

const { t } = useI18n()
useHydratedHead({
  title: () => t('nav.home'),
})
</script>

<template>
  <MainContent>
    <template #title>
      <NuxtLink to="/home" timeline-title-style flex items-center gap-2 @click="$scrollToTop">
        <div i-ri:home-5-line />
        <span>{{ $t('nav.home') }}</span>
      </NuxtLink>
    </template>

    <template v-if="currentUser">
      <p>Hello {{ currentUser?.profile.handle }}!</p>
      <p>Here you will see your timeline later on</p>
    </template>
    <template v-else>
      <p>You are currently not authenticated.</p>
      <p>Here you will see a public timeline later on</p>
    </template>
    <!-- <TimelineHome v-if="isHydrated" /> -->
  </MainContent>
</template>
