import type { Ref } from 'vue'

export function useSignIn(_input?: Ref<HTMLInputElement | undefined>) {
  const auth = useAuth()

  const busy = ref(false)
  const error = ref(false)
  const handle = ref('')
  const user_password = ref('')
  const displayError = ref(false)

  async function signIn() {
    if (busy.value)
      return

    busy.value = true
    error.value = false
    displayError.value = false

    await nextTick()

    try {
      await auth.signIn(handle.value)
      busy.value = false
      displayError.value = false
    }
    catch (e) {
      console.error('error', e)
      error.value = true
      displayError.value = true
      busy.value = false
    }
  }

  // TODO: remove singleInstanceServer
  return { busy, displayError, error, handle, signIn, singleInstanceServer: false, user_password }
}
