import { afterEach, describe, expect, it } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { createGameStore } from '../../game/store'
import { useTheme } from '../useTheme'
import { findTheme, isThemeId, THEMES } from '../themes'

describe('theme catalogue', () => {
  it('offers a bleed and a card variant', () => {
    expect(THEMES.map((theme) => theme.variant).sort()).toEqual(['bleed', 'card'])
  })

  it('recognises only known ids and falls back safely', () => {
    expect(isThemeId('pulse')).toBe(true)
    expect(isThemeId('nope')).toBe(false)
    expect(isThemeId(7)).toBe(false)
    expect(findTheme('nope').id).toBe('pulse')
  })
})

describe('useTheme', () => {
  let scope: ReturnType<typeof effectScope> | null = null

  afterEach(() => {
    scope?.stop()
    scope = null
    document.head.querySelector('meta[name="theme-color"]')?.remove()
  })

  it('mirrors the stored theme onto the document', async () => {
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = '#ffffff'
    document.head.appendChild(meta)

    const game = createGameStore()
    scope = effectScope()
    const { theme } = scope.run(() => useTheme(game))!

    expect(document.documentElement.dataset.theme).toBe('pulse')
    expect(meta.content).toBe('#111014')

    game.setTheme('arena')
    await nextTick()

    expect(theme.value.id).toBe('arena')
    expect(document.documentElement.dataset.theme).toBe('arena')
    expect(meta.content).toBe('#0b0d13')
  })

  it('works when the page has no theme-color meta tag', () => {
    const game = createGameStore({ themeId: 'arena' })
    scope = effectScope()
    scope.run(() => useTheme(game))

    expect(document.documentElement.dataset.theme).toBe('arena')
  })
})
