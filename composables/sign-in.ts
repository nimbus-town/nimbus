import type { Ref } from 'vue'
import { BrowserOAuthClient } from '@atproto/oauth-client-browser'

export function useSignIn(_input?: Ref<HTMLInputElement | undefined>) {
  const userSettings = useUserSettings()

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

    const isLocalDev = location.hostname === 'localhost'

    const client = await BrowserOAuthClient.load({
      clientId: isLocalDev ? 'http://localhost' : `${location.protocol}//${location.host}/client-metadata.json`,
      handleResolver: 'https://bsky.social/',
    })

    try {
      const url = await client.authorize(handle.value, {
        scope: 'atproto transition:generic',
        // prompt: users.value.length > 0 ? 'login' : 'none',
        ui_locales: userSettings.value.language,
        redirect_uri: isLocalDev ? `http://127.0.0.1:5314/oauth/callback` : `https://${location.host}/oauth/callback`,
      })

      location.href = url.toString()
    }
    catch (e) {
      console.error('error', e)
      error.value = true
      displayError.value = true
      busy.value = false
    }
  }

  return { busy, displayError, error, handle, oauth }
}
