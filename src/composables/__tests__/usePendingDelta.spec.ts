import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { usePendingDelta } from '../usePendingDelta'

const setup = (timeout = 2000) => {
  const scope = effectScope()
  return { pending: scope.run(() => usePendingDelta(timeout))!, scope }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('usePendingDelta', () => {
  it('accumulates changes and formats them with a sign', () => {
    const { pending } = setup()

    pending.add(-1)
    pending.add(-6)

    expect(pending.visible.value).toBe(true)
    expect(pending.value.value).toBe(-7)
    expect(pending.label.value).toBe('-7')

    pending.add(10)
    expect(pending.label.value).toBe('+3')
  })

  it('hides and restarts after the timeout', () => {
    const { pending } = setup()

    pending.add(-4)
    vi.advanceTimersByTime(1999)
    expect(pending.visible.value).toBe(true)

    vi.advanceTimersByTime(1)
    expect(pending.visible.value).toBe(false)
    expect(pending.value.value).toBe(0)

    pending.add(-2)
    expect(pending.value.value).toBe(-2)
  })

  it('extends the timeout while taps keep coming', () => {
    const { pending } = setup()

    pending.add(1)
    vi.advanceTimersByTime(1800)
    pending.add(1)
    vi.advanceTimersByTime(1800)

    expect(pending.visible.value).toBe(true)
    expect(pending.value.value).toBe(2)
  })

  it('ignores zero and invalid deltas', () => {
    const { pending } = setup()

    pending.add(0)
    pending.add(Number.NaN)

    expect(pending.visible.value).toBe(false)
  })

  it('reset clears the readout immediately', () => {
    const { pending } = setup()

    pending.add(5)
    pending.reset()

    expect(pending.visible.value).toBe(false)
    expect(pending.value.value).toBe(0)
  })
})
