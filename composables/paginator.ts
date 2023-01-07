import type { Paginator, WsEvents } from 'masto'
import type { PaginatorState } from '~/types'
import { onReactivated } from '~/composables/vue'

export function usePaginator<T>(
  paginator: Paginator<any, T[]>,
  stream?: Promise<WsEvents>,
  eventType: 'notification' | 'update' = 'update',
  preprocess: (items: T[]) => T[] = (items: T[]) => items,
) {
  const state = ref<PaginatorState>(isMastoInitialised.value ? 'idle' : 'loading')
  const items = ref<T[]>([])
  const nextItems = ref<T[]>([])
  const prevItems = ref<T[]>([])

  const endAnchor = ref<HTMLDivElement>()
  const bound = reactive(useElementBounding(endAnchor))
  const isInScreen = $computed(() => bound.top < window.innerHeight * 2)
  const error = ref<unknown | undefined>()
  const loaded = ref(false)

  const deactivated = useDeactivated()
  const nuxtApp = useNuxtApp()

  async function update() {
    items.value.unshift(...prevItems.value)
    prevItems.value = []
  }

  stream?.then((s) => {
    s.on(eventType, (status) => {
      if ('uri' in status)
        cacheStatus(status, undefined, true)

      const index = prevItems.value.findIndex((i: any) => i.id === status.id)
      if (index >= 0)
        prevItems.value.splice(index, 1)

      prevItems.value.unshift(status as any)
    })

    // TODO: update statuses
    s.on('status.update', (status) => {
      cacheStatus(status, undefined, true)

      const index = items.value.findIndex((s: any) => s.id === status.id)
      if (index >= 0)
        items.value[index] = status as any
    })

    s.on('delete', (id) => {
      removeCachedStatus(id)

      const index = items.value.findIndex((s: any) => s.id === id)
      if (index >= 0)
        items.value.splice(index, 1)
    })
  })

  async function loadNext() {
    if (state.value !== 'idle')
      return

    state.value = 'loading'
    try {
      const result = await paginator.next()

      if (result.value?.length) {
        nextItems.value = preprocess(result.value) as any
        items.value.push(...nextItems.value)
        state.value = 'idle'
      }
      else {
        state.value = 'done'
      }
    }
    catch (e) {
      error.value = e
      state.value = 'error'
    }

    await nextTick()
    bound.update()
    if (!loaded.value) {
      loaded.value = true
      await nextTick()
      nuxtApp.$restoreScrollPosition()
    }
  }

  if (process.client) {
    const timeout = ref()
    useIntervalFn(() => {
      bound.update()
    }, 1000)

    onDeactivated(() => {
      window.clearTimeout(timeout.value)
      loaded.value = false
    })
    onReactivated(() => {
      window.clearTimeout(timeout.value)
      if (isMastoInitialised.value) {
        if (!loaded.value)
          loaded.value = true

        timeout.value = setTimeout(() => nuxtApp.$restoreScrollPosition(), 600)
      }
      else {
        loaded.value = false
      }
    })

    if (!isMastoInitialised.value) {
      onMastoInit(() => {
        state.value = 'idle'
        loadNext()
      })
    }

    watch(
      () => [isInScreen, state],
      () => {
        if (
          isInScreen
          && state.value === 'idle'
          // No new content is loaded when the keepAlive page enters the background
          && deactivated.value === false
        )
          loadNext()
      },
    )
  }

  return {
    items,
    prevItems,
    nextItems,
    update,
    state,
    error,
    endAnchor,
  }
}
