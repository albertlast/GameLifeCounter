import { computed, onScopeDispose, ref } from 'vue'

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => value.toString().padStart(2, '0')
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}

/** Wall-clock based match timer, so it stays correct if the tab is throttled. */
export function useMatchTimer(now: () => number = () => Date.now()) {
  const elapsed = ref(0)
  const running = ref(false)
  let startedAt = 0
  let intervalId: ReturnType<typeof setInterval> | null = null

  const stopTicking = () => {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  const tick = () => {
    if (running.value) elapsed.value = now() - startedAt
  }

  const start = () => {
    if (running.value) return
    startedAt = now() - elapsed.value
    running.value = true
    stopTicking()
    intervalId = setInterval(tick, 250)
    tick()
  }

  const pause = () => {
    if (!running.value) return
    tick()
    running.value = false
    stopTicking()
  }

  const toggle = () => (running.value ? pause() : start())

  const reset = () => {
    stopTicking()
    running.value = false
    elapsed.value = 0
    startedAt = now()
  }

  const label = computed(() => formatDuration(elapsed.value))

  onScopeDispose(stopTicking)

  return { elapsed, running, label, start, pause, toggle, reset }
}
