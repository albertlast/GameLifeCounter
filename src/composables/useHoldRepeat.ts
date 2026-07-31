import { onScopeDispose, ref } from 'vue'

export interface HoldRepeatOptions {
  /** Fired on a short press. */
  onTap: () => void
  /** Fired once the press turns into a hold, then repeatedly. */
  onHold: () => void
  /** Delay before a press becomes a hold. */
  holdDelay?: number
  /** Interval between repeats while held. */
  repeatInterval?: number
}

/**
 * Press-and-hold behaviour for the life buttons: a tap applies the small
 * step, holding applies the big step over and over until release.
 *
 * A press belongs to the finger that started it: on a shared tablet a second
 * finger landing on the same button must not end somebody else's hold, so
 * `stop`/`cancel` only listen to the pointer that called `start`.
 */
export function useHoldRepeat(options: HoldRepeatOptions) {
  const holdDelay = options.holdDelay ?? 500
  const repeatInterval = options.repeatInterval ?? 180

  const isHolding = ref(false)
  let timerId: ReturnType<typeof setTimeout> | null = null
  let didHold = false
  let active = false
  let ownerId: number | null = null

  const clearTimer = () => {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  const repeat = () => {
    options.onHold()
    timerId = setTimeout(repeat, repeatInterval)
  }

  /** True when the event comes from the finger that owns the current press. */
  const owns = (pointerId?: number) =>
    ownerId === null || pointerId === undefined || pointerId === ownerId

  const start = (pointerId?: number) => {
    if (active) return
    active = true
    ownerId = pointerId ?? null
    didHold = false
    clearTimer()
    timerId = setTimeout(() => {
      didHold = true
      isHolding.value = true
      repeat()
    }, holdDelay)
  }

  /** Release: applies a tap when the press never became a hold. */
  const stop = (pointerId?: number) => {
    if (!active || !owns(pointerId)) return
    active = false
    ownerId = null
    clearTimer()
    if (!didHold) options.onTap()
    didHold = false
    isHolding.value = false
  }

  /** Aborts the press without applying anything (pointer left / cancelled). */
  const cancel = (pointerId?: number) => {
    if (!owns(pointerId)) return
    active = false
    ownerId = null
    didHold = false
    isHolding.value = false
    clearTimer()
  }

  onScopeDispose(cancel)

  return { start, stop, cancel, isHolding }
}
