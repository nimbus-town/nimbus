<script setup lang="ts">
defineProps<{
  title?: string
  message: string
}>()
const modelValue = defineModel<boolean>({ required: true })
</script>

<template>
  <div
    v-if="modelValue"
    role="alert"
    aria-describedby="notification-failed"
    flex="~ col"
    gap-1 text-sm
    pt-1 ps-2 pe-1 pb-2
    text-red-600 dark:text-red-400
    border="~ base rounded red-600 dark:red-400"
  >
    <header id="notification-failed" flex justify-between>
      <div flex items-center gap-x-2 font-bold>
        <div aria-hidden="true" i-ri:error-warning-fill />
        <p>{{ title ?? $t('settings.notifications.push_notifications.subscription_error.title') }}</p>
      </div>
      <CommonTooltip placement="bottom" :content="$t('settings.notifications.push_notifications.subscription_error.clear_error')">
        <button
          flex rounded-4 p1
          hover:bg-active cursor-pointer transition-100
          :aria-label="$t('settings.notifications.push_notifications.subscription_error.clear_error')"
          @click="modelValue = false"
        >
          <span aria-hidden="true" w="1.75em" h="1.75em" i-ri:close-line />
        </button>
      </CommonTooltip>
    </header>
    <p>{{ message }}</p>
    <p py-2>
      <i18n-t keypath="settings.notifications.push_notifications.subscription_error.error_hint">
        <NuxtLink font-bold href="https://docs.nimbus.town/pwa#faq" target="_blank" inline-flex="~ row" items-center gap-x-2>
          https://docs.nimbus.town/pwa#faq
          <span inline-block aria-hidden="true" i-ri:external-link-line class="rtl-flip" />
        </NuxtLink>
      </i18n-t>
    </p>
    <p py-2>
      <NuxtLink font-bold text-primary href="https://github.com/nimbus-town/nimbus" target="_blank" flex="~ row" items-center gap-x-2>
        {{ $t('settings.notifications.push_notifications.subscription_error.repo_link') }}
        <span inline-block aria-hidden="true" i-ri:external-link-line class="rtl-flip" />
      </NuxtLink>
    </p>
  </div>
</template>
