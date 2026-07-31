import { computed, watchEffect } from 'vue'
import { useGame } from '../game/store'
import { findTheme } from './themes'
import type { GameStore } from '../game/store'

const THEME_COLORS: Record<string, string> = {
  pulse: '#111014',
  arena: '#0b0d13',
}

/**
 * Keeps `<html data-theme>` and the browser theme-colour in sync with the
 * theme stored in the game state.
 */
export function useTheme(store: GameStore = useGame()) {
  const theme = computed(() => findTheme(store.state.themeId))

  watchEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = theme.value.id

    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (meta) meta.content = THEME_COLORS[theme.value.id] ?? '#111014'
  })

  return { theme }
}
