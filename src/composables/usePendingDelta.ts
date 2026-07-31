import { computed, onScopeDispose, ref } from 'vue'

const formatter = new Intl.NumberFormat('en-US', { signDisplay: 'exceptZero' })

/**
 * Accumulates the life changes of the last few seconds so a player can see
 * "-7" while they tap, then it fades out.
 */
export function usePendingDelta(timeout = 2500) {
  const value = ref(0)
  const visible = ref(false)
  let timerId: ReturnType<typeof setTimeout> | null = null

  const clear = () => {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  const add = (delta: number) => {
    if (!Number.isFinite(delta) || delta === 0) return
    if (!visible.value) {
      value.value = 0
      visible.value = true
    }
    value.value += delta
    clear()
    timerId = setTimeout(() => {
      visible.value = false
      value.value = 0
    }, timeout)
  }

  const reset = () => {
    clear()
    visible.value = false
    value.value = 0
  }

  const label = computed(() => formatter.format(value.value))

  onScopeDispose(clear)

  return { value, visible, label, add, reset }
}
