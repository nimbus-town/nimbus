import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware((to) => {
  if (process.server)
    return

  // eslint-disable-next-line no-console
  console.info('auth middleware', to.path)

  if (
    to.path === '/signin/callback'
      || to.path.startsWith('/_nuxt/')
      || to.path.startsWith('/avatars/')
      || to.path.startsWith('/emojis/')
      || to.path.startsWith('/fonts/')
      || to.path.startsWith('/screenshots/')
      || to.path.startsWith('/shiki/')
      || to.path.startsWith('/manifest-')
      || to.path.startsWith('/sw.js')
      || to.path.match(/^\/(apple-touch-icon|elk-og|favicon|logo|maskable-icon|pwa-192x192|pwa-512x512|robots)\.(png|ico|svg|txt)$/)
  )
    return

  if (isHydrated.value)
    return handleAuth(to)

  onHydrated(() => handleAuth(to))
})

function handleAuth(to: RouteLocationNormalized) {
  if (!currentUser.value) {
    if (to.path === '/home' && to.query['share-target'] !== undefined)
      return navigateTo('/share-target')
    else
      return navigateTo(`/${currentServer.value}/public/local`)
  }
  if (to.path === '/')
    return navigateTo('/home')
}
