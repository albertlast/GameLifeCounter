export type ThemeId = 'pulse' | 'arena'

export interface ThemeDefinition {
  id: ThemeId
  name: string
  tagline: string
  /**
   * How a player panel is drawn:
   * - `bleed`: edge-to-edge colour field, the whole half is the tap target.
   * - `card`: dark stage with a floating card and explicit controls.
   */
  variant: 'bleed' | 'card'
  /** Two hues used for the settings preview swatch. */
  preview: [number, number]
}

export const THEMES: [ThemeDefinition, ThemeDefinition] = [
  {
    id: 'pulse',
    name: 'Pulse',
    tagline: 'Full-bleed colour, oversized numerals.',
    variant: 'bleed',
    preview: [32, 222],
  },
  {
    id: 'arena',
    name: 'Arena',
    tagline: 'Dark stage with floating player cards.',
    variant: 'card',
    preview: [265, 190],
  },
]

export const DEFAULT_THEME_ID: ThemeId = 'pulse'

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEMES.some((theme) => theme.id === value)
}

export function findTheme(id: string): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0]
}
