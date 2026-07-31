export type CounterKind = 'poison' | 'energy'

export interface Player {
  id: number
  name: string
  /** Hue (0-359) used by every theme as the player's identity colour. */
  hue: number
  life: number
  counters: Record<CounterKind, number>
}

export interface GamePreset {
  id: string
  name: string
  description: string
  startingLife: number
  /** Life change of a single tap. */
  step: number
  /** Life change applied repeatedly while a button is held down. */
  bigStep: number
  /** Extra counters shown on the player panel. */
  counters: CounterKind[]
}

/**
 * How far the panel turns so it reads upright from its player's seat: 0° for
 * the bottom edge, 180° for the top and — in the `sides` layout — 90° for the
 * left edge and 270° for the right.
 */
export type Rotation = 0 | 90 | 180 | 270

export interface SeatPlacement {
  /** Rotation that makes the panel readable from the player's seat. */
  rotation: Rotation
  /** CSS `grid-area` shorthand: row-start / col-start / row-end / col-end. */
  gridArea: string
}

export interface SeatLayout {
  columns: number
  rows: number
  seats: SeatPlacement[]
}

export interface GameState {
  presetId: string
  themeId: string
  layoutId: string
  playerCount: number
  startingLife: number
  players: Player[]
}

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 6

/** Player counts with a defined seat layout. */
export type PlayerCount = 2 | 3 | 4 | 5 | 6

export const COUNTER_LABELS: Record<CounterKind, string> = {
  poison: 'Poison',
  energy: 'Energy',
}

export const COUNTER_ICONS: Record<CounterKind, string> = {
  poison: '☠',
  energy: '⚡',
}
