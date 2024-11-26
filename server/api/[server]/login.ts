import { JoseKey } from '@atproto/jwk-jose' // NodeJS/Browser only
import { AtprotoHandleResolver, type InternalStateData, type Key, OAuthClient, type Session } from '@atproto/oauth-client'

// based on: https://github.com/unjs/unenv/issues/198
async function _getTxtRecords(hostname: string): Promise<string[]> {
  const response = await fetch(`https://1.1.1.1/dns-query?name=${hostname}&type=TXT`, {
    headers: {
      accept: 'application/dns-json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  const json: {
    Status: number
    TC: boolean
    RD: boolean
    RA: boolean
    AD: boolean
    CD: boolean
    Question: any[]
    Answer: {
      name: string
      type: number
      TTL: number
      data: string
    }[]
    Additional: any[]
  } = await response.json()

  return json.Answer.map(a => a.data.replace(/^"|"$/g, ''))
}

export default defineEventHandler(async (event) => {
  const { handle, origin, force_login, lang } = await readBody<{ handle?: string, origin?: string, force_login?: boolean, lang?: string }>(event)

  // eslint-disable-next-line no-console
  console.log('handle', {
    handle,
    origin,
    force_login,
    lang,
  })

  // const publicUrl = 'http://127.0.0.1:5314'
  const publicUrl = 'https://cc-tennessee-annually-necessary.trycloudflare.com'
  const url = publicUrl || `http://127.0.0.1:${process.env.PORT || 5314}`

  const oauthClient = new OAuthClient({
    // handleResolver: new AtprotoHandleResolver({
    //   /**
    //    * DNS TXT record resolver. Return `null` if the hostname successfully does not
    //    * resolve to a valid DID. Throw an error if an unexpected error occurs.
    //    */

    //   resolveTxt: async (hostname: string): Promise<null | string[]> => {
    //     const txtData = await getTxtRecords(hostname)
    //     const txt = txtData.filter(txt => txt.startsWith('did=')).map(txt => txt.slice(4))
    //     return txt
    //   },
    // }),
    handleResolver: 'https://bsky.social/',
    responseMode: 'query', // or "fragment" (frontend only) or "form_post" (backend only)

    // These must be the same metadata as the one exposed on the
    // "client_id" endpoint (except when using a loopback client)
    clientMetadata: {
      client_name: 'AT Protocol Express App',
      client_id: `${url}/client-metadata.json`,
      client_uri: url,
      redirect_uris: [`${url}/oauth/callback`],
      scope: 'atproto transition:generic',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      application_type: 'web',
      token_endpoint_auth_method: 'none',
      dpop_bound_access_tokens: true,
    },

    runtimeImplementation: {
    // A runtime specific implementation of the crypto operations needed by the
    // OAuth client. See "@atproto/oauth-client-browser" for a browser specific
    // implementation. The following example is suitable for use in NodeJS.

      createKey(algs: string[]): Promise<Key> {
      // algs is an ordered array of preferred algorithms (e.g. ['RS256', 'ES256'])

        // Note, in browser environments, it is better to use non extractable keys
        // to prevent the private key from being stolen. This can be done using
        // the WebcryptoKey class from the "@atproto/jwk-webcrypto" package. The
        // inconvenient of these keys (which is also what makes them stronger) is
        // that the only way to persist them across browser reloads is to save
        // them in the indexed DB.
        return JoseKey.generate(algs)
      },

      getRandomValues(length: number): Uint8Array | PromiseLike<Uint8Array> {
        return crypto.getRandomValues(new Uint8Array(length))
      },

      async digest(
        bytes: Uint8Array,
        algorithm: { name: string },
      ): Promise<Uint8Array | PromiseLike<Uint8Array>> {
      // sha256 is required. Unsupported algorithms should throw an error.

        if (algorithm.name.startsWith('sha')) {
          const subtleAlgo = `SHA-${algorithm.name.slice(3)}`
          const buffer = await crypto.subtle.digest(subtleAlgo, bytes)
          return new Uint8Array(buffer)
        }

        throw new Error(`Unsupported algorithm: ${algorithm.name}`)
      },

      requestLock: <T>(
        name: string,
        fn: () => T | PromiseLike<T>,
      ): Promise<T> => {
      // This function is used to prevent concurrent refreshes of the same
      // credentials. It is important to ensure that only one refresh is done at
      // a time to prevent the sessions from being revoked.

        // The following example shows a simple in-memory lock. In a real
        // application, you should use a more robust solution (e.g. a system wide
        // lock manager). Note that not providing a lock will result in an
        // in-memory lock to be used (DO NOT copy-paste the following code).

        declare const locks: Map<string, Promise<void | T>>

        const current = locks.get(name) || Promise.resolve()
        const next = current
          .then(fn)
          .finally(() => {
            if (locks.get(name) === next)
              locks.delete(name)
          })

        locks.set(name, next)
        return next
      },
    },

    stateStore: {
    // A store for saving state data while the user is being redirected to the
    // authorization server.

      set(_key: string, _internalState: InternalStateData): Promise<void> {
        throw new Error('Not implemented')
      },
      get(_key: string): Promise<InternalStateData | undefined> {
        throw new Error('Not implemented')
      },
      del(_key: string): Promise<void> {
        throw new Error('Not implemented')
      },
    },

    sessionStore: {
    // A store for saving session data.

      set(_sub: string, _session: Session): Promise<void> {
        throw new Error('Not implemented')
      },
      get(_sub: string): Promise<Session | undefined> {
        throw new Error('Not implemented')
      },
      del(_sub: string): Promise<void> {
        throw new Error('Not implemented')
      },
    },

    keyset: [
    // For backend clients only, a list of private keys to use for signing
    // credentials. These keys MUST correspond to the public keys exposed on the
    // "jwks_uri" of the client metadata. Note that the jwks JSON corresponding
    // to the following keys can be obtained using the `client.jwks` getter.

      // await JoseKey.fromImportable(PRIVATE_KEY_1),
      // await JoseKey.fromImportable(PRIVATE_KEY_2),
      // await JoseKey.fromImportable(PRIVATE_KEY_3),
    ],

    plcDirectoryUrl: 'https://plc.directory',
  })

  const redirectUrl = await oauthClient.authorize(handle.startsWith('@') ? handle.slice(1) : handle, {
    scope: 'atproto transition:generic',
    prompt: force_login ? 'login' : undefined,
    ui_locales: lang,
  })

  return redirectUrl
})
