<script setup lang="ts">
const input = ref<HTMLInputElement | undefined>()
const { busy, error, displayError, handle, signIn, user_password } = useSignIn(input)

async function handleInput() {
  const user_handle = handle.value.trim()
  const user_password = handle.value.trim()
  if (user_handle.length && user_password.length)
    displayError.value = false
}

onMounted(async () => {
  input?.value?.focus()
})
</script>

<template>
  <form text-center justify-center items-center max-w-150 py6 flex="~ col gap-3" @submit.prevent="signIn">
    <div flex="~ center" items-end mb2 gap-x-2>
      <NavLogo />
      <div text-3xl>
        {{ $t('action.sign_in') }}
      </div>
    </div>
    <div flex flex-col gap-5 pt-5 :class="error ? 'animate animate-shake-x animate-delay-100' : null">
      <div
        dir="ltr"
        flex bg-gray:10 px4 py2 mxa rounded
        border="~ base" items-center font-mono
        focus:outline-none focus:ring="2 primary inset"
        relative
        :class="displayError ? 'border-red-600 dark:border-red-400' : null"
      >
        <input
          ref="input"
          v-model="handle"
          autocapitalize="off"
          :placeholder="$t('user.handle_label')"
          inputmode="url"
          outline-none bg-transparent w-full max-w-50
          spellcheck="false"
          autocorrect="off"
          autocomplete="off"
          @input="handleInput"
        >
      </div>
      <div
        dir="ltr"
        flex bg-gray:10 px4 py2 mxa rounded
        border="~ base" items-center font-mono
        focus:outline-none focus:ring="2 primary inset"
        relative
        :class="displayError ? 'border-red-600 dark:border-red-400' : null"
      >
        <input
          ref="input"
          v-model="user_password"
          autocapitalize="off"
          inputmode="text"
          type="password"
          :placeholder="$t('user.user_password_label')"

          outline-none bg-transparent w-full max-w-50
          spellcheck="false"
          autocorrect="off"
          autocomplete="off"
          @input="handleInput"
        >
      </div>
    </div>

    <div min-h-4>
      <Transition v-if="error" css enter-active-class="animate animate-fade-in">
        <p v-if="displayError" role="alert" p-0 m-0 text-xs text-red-600 dark:text-red-400>
          {{ $t('error.sign_in_error') }}
        </p>
      </Transition>
    </div>
    <button flex="~ row" gap-x-2 items-center btn-solid mt2 :disabled="!handle || !user_password || busy">
      <span v-if="busy" aria-hidden="true" block animate animate-spin preserve-3d class="rtl-flip">
        <span block i-ri:loader-2-fill aria-hidden="true" />
      </span>
      <span v-else aria-hidden="true" block i-ri:login-circle-line class="rtl-flip" />
      {{ $t('action.sign_in') }}
    </button>
  </form>
</template>
