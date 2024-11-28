import { OAUTH_SCOPE } from '~/constants'

export default defineEventHandler(async (event) => {
  const requestUrl = getRequestURL(event)

  const proto = getHeader(event, 'x-forwarded-proto')
  const host = getHeader(event, 'x-forwarded-host')
  if (proto && host) {
    const { protocol, hostname, port } = new URL(`${proto}://${host}`)
    requestUrl.protocol = protocol
    requestUrl.hostname = hostname
    requestUrl.port = port
  }

  return {
    client_id: requestUrl.href,
    client_uri: new URL('/', requestUrl).href,
    redirect_uris: [new URL('/', requestUrl).href],
    response_types: ['code'],
    grant_types: ['authorization_code'],
    token_endpoint_auth_method: 'none',
    scope: OAUTH_SCOPE,
    dpop_bound_access_tokens: true,
    application_type: 'web',
    client_name: 'Nimbus',
    logo_uri: new URL(
      '/pwa-192x192.png',
      requestUrl,
    ).href,
    // tos_uri: 'https://example.com/tos',
    // policy_uri: 'https://example.com/policy',
    // jwks_uri: 'https://example.com/jwks',
  }
})
