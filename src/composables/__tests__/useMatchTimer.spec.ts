import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { formatDuration, useMatchTimer } from '../useMatchTimer'

describe('formatDuration', () => {
  it('formats minutes and seconds, adding hours only when needed', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(9_000)).toBe('00:09')
    expect(formatDuration(61_000)).toBe('01:01')
    expect(formatDuration(3_600_000)).toBe('1:00:00')
    expect(formatDuration(-500)).toBe('00:00')
  })
})

describe('useMatchTimer', () => {
  let clock = 1000
  let scope: ReturnType<typeof effectScope>
  let timer: ReturnType<typeof useMatchTimer>

  beforeEach(() => {
    vi.useFakeTimers()
    clock = 1000
    scope = effectScope()
    timer = scope.run(() => useMatchTimer(() => clock))!
  })

  afterEach(() => {
    scope.stop()
    vi.useRealTimers()
  })

  it('counts wall-clock time while running', () => {
    timer.start()
    clock += 5000
    vi.advanceTimersByTime(1000)

    expect(timer.running.value).toBe(true)
    expect(timer.elapsed.value).toBe(5000)
    expect(timer.label.value).toBe('00:05')
  })

  it('freezes on pause and continues from there', () => {
    timer.start()
    clock += 5000
    vi.advanceTimersByTime(1000)
    timer.pause()

    clock += 10_000
    vi.advanceTimersByTime(1000)
    expect(timer.elapsed.value).toBe(5000)

    timer.start()
    clock += 2000
    vi.advanceTimersByTime(500)
    expect(timer.elapsed.value).toBe(7000)
  })

  it('toggles and resets', () => {
    timer.toggle()
    expect(timer.running.value).toBe(true)

    timer.toggle()
    expect(timer.running.value).toBe(false)

    clock += 3000
    timer.start()
    clock += 4000
    vi.advanceTimersByTime(500)
    timer.reset()

    expect(timer.elapsed.value).toBe(0)
    expect(timer.running.value).toBe(false)
    expect(timer.label.value).toBe('00:00')
  })

  it('stops ticking once the scope is gone', () => {
    timer.start()
    scope.stop()

    clock += 9000
    vi.advanceTimersByTime(2000)

    expect(timer.elapsed.value).toBe(0)
  })
})
