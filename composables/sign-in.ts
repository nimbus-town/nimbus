import type { Ref } from 'vue'

export function useSignIn(input?: Ref<HTMLInputElement | undefined>) {
  const userSettings = useUserSettings()
  const users = useUsers()

  const busy = ref(false)
  const error = ref(false)
  const handle = ref('')
  const displayError = ref(false)

  async function oauth() {
    if (busy.value)
      return

    busy.value = true
    error.value = false
    displayError.value = false

    await nextTick()

    try {
      location.href = await (globalThis.$fetch as any)(`/api/${publicServer.value}/login`, {
        method: 'POST',
        body: {
          handle: handle.value,
          force_login: users.value.length > 0,
          origin: location.origin,
          lang: userSettings.value.language,
        },
      })
      busy.value = false
    }
    catch (err) {
      displayError.value = true
      error.value = true
      await nextTick()
      input?.value?.focus()
      await nextTick()
      setTimeout(() => {
        busy.value = false
        error.value = false
      }, 512)
    }
  }

  return { busy, displayError, error, handle, oauth }
}
