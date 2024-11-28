import type { Pausable } from '@vueuse/core'
import type { mastodon } from 'masto'
import type { Ref } from 'vue'

export function createMasto() {
  return {
    client: shallowRef<mastodon.rest.Client>(undefined as never),
    streamingClient: shallowRef<mastodon.streaming.Client | undefined>(),
  }
}
export type ElkMasto = ReturnType<typeof createMasto>

export function useMasto() {
  return useNuxtApp().$masto as ElkMasto
}
export function useMastoClient() {
  return useMasto().client.value
}

interface UseStreamingOptions<Controls extends boolean> {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls
  /**
   * Connect on calling
   *
   * @default true
   */
  immediate?: boolean
}

export function useStreaming(
  cb: (client: mastodon.streaming.Client) => mastodon.streaming.Subscription,
  options: UseStreamingOptions<true>,
): { stream: Ref<mastodon.streaming.Subscription | undefined> } & Pausable
export function useStreaming(
  cb: (client: mastodon.streaming.Client) => mastodon.streaming.Subscription,
  options?: UseStreamingOptions<false>,
): Ref<mastodon.streaming.Subscription | undefined>
export function useStreaming(
  cb: (client: mastodon.streaming.Client) => mastodon.streaming.Subscription,
  { immediate = true, controls }: UseStreamingOptions<boolean> = {},
): ({ stream: Ref<mastodon.streaming.Subscription | undefined> } & Pausable) | Ref<mastodon.streaming.Subscription | undefined> {
  const { streamingClient } = useMasto()

  const isActive = ref(immediate)
  const stream = ref<mastodon.streaming.Subscription>()

  function pause() {
    isActive.value = false
  }

  function resume() {
    isActive.value = true
  }

  function cleanup() {
    if (stream.value) {
      stream.value.unsubscribe()
      stream.value = undefined
    }
  }

  watchEffect(() => {
    cleanup()
    if (streamingClient.value && isActive.value)
      stream.value = cb(streamingClient.value)
  })

  if (import.meta.client && !process.test)
    useNuxtApp().$pageLifecycle.addFrozenListener(cleanup)

  tryOnBeforeUnmount(() => isActive.value = false)

  if (controls)
    return { stream, isActive, pause, resume }
  else
    return stream
}
