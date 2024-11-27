import type { Ref } from 'vue'
import { BrowserOAuthClient } from '@atproto/oauth-client-browser'

function isLoopbackHost(host: string) {
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
}

async function useOAuthClient() {
  const isLocalDev = typeof window !== 'undefined' && isLoopbackHost(window.location.hostname)

  let clientId = `${window.location.protocol}//${window.location.host}/client-metadata.json`

  if (isLocalDev) {
    // The following requires a yet to be released version of the oauth-client:
    // &scope=${OAUTH_SCOPE.split(' ').map(encodeURIComponent).join('+')}
    clientId = `http://localhost?redirect_uri=${encodeURIComponent(
      new URL(
        `http://127.0.0.1${
          window.location.port ? `:${window.location.port}` : ''
        }/oauth/callback`,
      ).href,
    )}`
  }

  const client = await BrowserOAuthClient.load({
    clientId,
    handleResolver: 'https://api.bsky.app',
    plcDirectoryUrl: 'https://plc.directory',
  })

  return client
}

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

    try {
      const client = await useOAuthClient()

      const authUrl = await client.authorize(handle.value, {
        // scope: 'atproto transition:generic',
        // prompt: users.value.length > 0 ? 'login' : 'none',
        ui_locales: userSettings.value.language,
        // redirect_uri: isLocalDev ? `http://localhost` : `https://${window.location.host}/oauth/callback`, // TODO: not sure why this is not working
      })

      window.location.href = authUrl.toString()
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
