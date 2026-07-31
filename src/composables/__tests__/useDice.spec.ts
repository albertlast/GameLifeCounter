import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { DICE_SIDES, rollDie, useDice } from '../useDice'

describe('rollDie', () => {
  it('covers the whole range of the die', () => {
    expect(rollDie(6, () => 0)).toBe(1)
    expect(rollDie(6, () => 0.999)).toBe(6)
    expect(rollDie(20, () => 0.5)).toBe(11)
  })

  it('never exceeds the die even for a random() of 1', () => {
    for (const sides of DICE_SIDES) {
      expect(rollDie(sides, () => 1)).toBe(sides)
    }
  })

  it('stays sane for nonsense input', () => {
    expect(rollDie(1, () => 0.99)).toBe(2)
    expect(rollDie(6.7, () => 0)).toBe(1)
  })

  it('produces every face over many rolls', () => {
    const seen = new Set<number>()
    for (let i = 0; i < 400; i += 1) seen.add(rollDie(6))
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6])
  })
})

describe('useDice', () => {
  let scope: ReturnType<typeof effectScope>

  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    scope?.stop()
    vi.useRealTimers()
  })

  const setup = (random: () => number) => {
    scope = effectScope()
    return scope.run(() => useDice(random))!
  }

  it('records the roll and keeps a short history', () => {
    const dice = setup(() => 0.5)

    const result = dice.roll(20)

    expect(result).toEqual({ sides: 20, value: 11 })
    expect(dice.last.value).toEqual(result)
    expect(dice.history.value[0]).toEqual(result)
  })

  it('caps the history at eight entries, newest first', () => {
    const dice = setup(() => 0)

    for (let i = 0; i < 12; i += 1) dice.roll(6)
    dice.roll(20)

    expect(dice.history.value).toHaveLength(8)
    expect(dice.history.value[0].sides).toBe(20)
  })

  it('flags a roll as animating and settles again', () => {
    const dice = setup(() => 0.5)

    dice.roll(6)
    expect(dice.rolling.value).toBe(true)

    vi.advanceTimersByTime(320)
    expect(dice.rolling.value).toBe(false)
  })

  it('clears the results', () => {
    const dice = setup(() => 0.5)
    dice.roll(6)

    dice.clear()

    expect(dice.last.value).toBeNull()
    expect(dice.history.value).toEqual([])
  })
})
