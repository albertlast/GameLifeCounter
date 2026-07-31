import { describe, expect, it, vi } from 'vitest'
import { clearLegacyState, readJson, readLegacyState, writeJson } from '../storage'

describe('storage helpers', () => {
  it('round-trips JSON', () => {
    writeJson('glc.test', { a: 1 })
    expect(readJson<{ a: number }>('glc.test')).toEqual({ a: 1 })
  })

  it('returns null for missing or broken entries', () => {
    expect(readJson('glc.missing')).toBeNull()
    localStorage.setItem('glc.broken', '{')
    expect(readJson('glc.broken')).toBeNull()
  })

  it('does not throw when storage rejects writes', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    expect(() => writeJson('glc.test', { a: 1 })).not.toThrow()
    setItem.mockRestore()
  })
})

describe('legacy state', () => {
  it('reads nothing when the old keys are absent', () => {
    expect(readLegacyState()).toBeNull()
  })

  it('fills in defaults for partially stored legacy data', () => {
    localStorage.setItem('glcP1Hue.Color', '120')

    expect(readLegacyState()).toEqual({ lives: [20, 20], hues: [120, 222] })
  })

  it('clears the old keys', () => {
    localStorage.setItem('glcfirst.life', '5')
    localStorage.setItem('glcP2Hue.Color', '10')

    clearLegacyState()

    expect(readLegacyState()).toBeNull()
  })
})
