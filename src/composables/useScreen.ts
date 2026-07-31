import { onMounted, onScopeDispose, ref } from 'vue'

/** Fullscreen toggle that stays in sync when the user leaves via Esc. */
export function useFullscreen() {
  const supported = ref(
    typeof document !== 'undefined' &&
      typeof document.documentElement?.requestFullscreen === 'function',
  )
  const isFullscreen = ref(false)
  const error = ref<string | null>(null)

  const sync = () => {
    if (typeof document === 'undefined') return
    isFullscreen.value = document.fullscreenElement !== null
  }

  const toggle = async () => {
    if (!supported.value) return
    error.value = null
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    }
    sync()
  }

  onMounted(() => {
    sync()
    document.addEventListener('fullscreenchange', sync)
  })
  onScopeDispose(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('fullscreenchange', sync)
    }
  })

  return { supported, isFullscreen, error, toggle }
}

type WakeLockNavigator = Navigator & {
  wakeLock?: { request(type: 'screen'): Promise<WakeLockSentinel> }
}

/** Keeps the screen awake during a game, re-acquiring after tab switches. */
export function useWakeLock() {
  const nav = typeof navigator === 'undefined' ? undefined : (navigator as WakeLockNavigator)
  const supported = ref(typeof nav?.wakeLock?.request === 'function')
  const active = ref(false)
  const error = ref<string | null>(null)
  let sentinel: WakeLockSentinel | null = null

  const request = async () => {
    if (!supported.value || !nav?.wakeLock) return
    try {
      sentinel = await nav.wakeLock.request('screen')
      active.value = true
      sentinel.addEventListener('release', () => {
        active.value = false
        sentinel = null
      })
    } catch (e) {
      error.value = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
      active.value = false
    }
  }

  const release = async () => {
    try {
      await sentinel?.release()
    } catch {
      // Sentinel may already be gone; the state below is what matters.
    }
    sentinel = null
    active.value = false
  }

  const toggle = async () => {
    error.value = null
    if (active.value) await release()
    else await request()
  }

  // Browsers drop the lock when the tab is hidden; take it back on return.
  const onVisibility = () => {
    if (document.visibilityState === 'visible' && active.value && sentinel === null) {
      void request()
    }
  }

  onMounted(() => document.addEventListener('visibilitychange', onVisibility))
  onScopeDispose(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibility)
    }
    void release()
  })

  return { supported, active, error, toggle }
}
