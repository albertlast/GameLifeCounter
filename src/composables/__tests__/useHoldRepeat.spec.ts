import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useHoldRepeat } from '../useHoldRepeat'

const setup = () => {
  const onTap = vi.fn()
  const onHold = vi.fn()
  const scope = effectScope()
  const hold = scope.run(() =>
    useHoldRepeat({ onTap, onHold, holdDelay: 500, repeatInterval: 100 }),
  )!
  return { onTap, onHold, hold, scope }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('useHoldRepeat', () => {
  it('applies a single tap on a short press', () => {
    const { hold, onTap, onHold } = setup()

    hold.start()
    vi.advanceTimersByTime(200)
    hold.stop()

    expect(onTap).toHaveBeenCalledTimes(1)
    expect(onHold).not.toHaveBeenCalled()
  })

  it('repeats while held and skips the tap on release', () => {
    const { hold, onTap, onHold } = setup()

    hold.start()
    vi.advanceTimersByTime(500)
    expect(onHold).toHaveBeenCalledTimes(1)
    expect(hold.isHolding.value).toBe(true)

    vi.advanceTimersByTime(300)
    expect(onHold).toHaveBeenCalledTimes(4)

    hold.stop()
    vi.advanceTimersByTime(1000)

    expect(onHold).toHaveBeenCalledTimes(4)
    expect(onTap).not.toHaveBeenCalled()
    expect(hold.isHolding.value).toBe(false)
  })

  it('cancelling a press applies nothing', () => {
    const { hold, onTap, onHold } = setup()

    hold.start()
    vi.advanceTimersByTime(550)
    hold.cancel()
    vi.advanceTimersByTime(1000)

    expect(onHold).toHaveBeenCalledTimes(1)
    expect(onTap).not.toHaveBeenCalled()
  })

  it('ignores a second start while a press is active', () => {
    const { hold, onTap } = setup()

    hold.start()
    hold.start()
    hold.stop()

    expect(onTap).toHaveBeenCalledTimes(1)
  })

  it('lets only the finger that started the press end it', () => {
    const { hold, onTap, onHold } = setup()

    hold.start(1)
    vi.advanceTimersByTime(500)
    expect(onHold).toHaveBeenCalledTimes(1)

    // A second finger lands on the same button and lifts again.
    hold.start(2)
    hold.stop(2)
    vi.advanceTimersByTime(200)
    expect(onHold).toHaveBeenCalledTimes(3)
    expect(onTap).not.toHaveBeenCalled()

    hold.stop(1)
    vi.advanceTimersByTime(500)
    expect(onHold).toHaveBeenCalledTimes(3)
  })

  it('ignores a cancel that belongs to another finger', () => {
    const { hold, onHold } = setup()

    hold.start(1)
    hold.cancel(2)
    vi.advanceTimersByTime(500)

    expect(onHold).toHaveBeenCalledTimes(1)
  })

  it('a release without a press does nothing', () => {
    const { hold, onTap } = setup()

    hold.stop()

    expect(onTap).not.toHaveBeenCalled()
  })

  it('stops repeating when the scope is disposed', () => {
    const { hold, onHold, scope } = setup()

    hold.start()
    vi.advanceTimersByTime(500)
    scope.stop()
    vi.advanceTimersByTime(1000)

    expect(onHold).toHaveBeenCalledTimes(1)
  })
})
