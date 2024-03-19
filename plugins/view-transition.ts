export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:view-transition:start', (transition) => {
    const viewTransitionInProgress = getIsViewTransitionInProgress()
    viewTransitionInProgress.value = true

    transition.finished
      .then(() => viewTransitionInProgress.value = false)
  })
})
