import type { PlayerCount, SeatLayout, SeatPlacement, Rotation } from './types'
import { MAX_PLAYERS, MIN_PLAYERS } from './types'

interface SeatSpec {
  row: number
  column: number
  rowSpan?: number
  columnSpan?: number
  rotation: Rotation
}

interface LayoutSpec {
  columns: number
  rows: number
  seats: SeatSpec[]
}

export type LayoutId = 'facing' | 'sides' | 'stacked' | 'head'

export interface LayoutDefinition {
  id: LayoutId
  name: string
  description: string
  /**
   * Player counts the layout is offered for. Omitted means every count; only
   * `head` restricts itself, because it needs an even number of players left
   * over to split between the two sides.
   */
  playerCounts?: PlayerCount[]
}

export const TABLE_LAYOUTS: LayoutDefinition[] = [
  {
    id: 'facing',
    name: 'Facing',
    description: 'Players sit along the top and bottom edge, facing each other.',
  },
  {
    id: 'sides',
    name: 'Sides',
    description: 'Players sit along the left and right edge; seats turn sideways.',
  },
  {
    id: 'head',
    name: 'Head of table',
    description: 'One player at the head, the rest facing each other down the sides.',
    playerCounts: [3, 5],
  },
  {
    id: 'stacked',
    name: 'Same side',
    description: 'Everyone sits on the same side; all seats stay upright.',
  },
]

export const DEFAULT_LAYOUT_ID: LayoutId = 'facing'

export function isLayoutId(value: unknown): value is LayoutId {
  return typeof value === 'string' && TABLE_LAYOUTS.some((layout) => layout.id === value)
}

export function findLayout(id: string): LayoutDefinition {
  const match = TABLE_LAYOUTS.find((layout) => layout.id === id)
  return match ?? TABLE_LAYOUTS[0]!
}

function toPlacement(spec: SeatSpec): SeatPlacement {
  const rowEnd = spec.row + (spec.rowSpan ?? 1)
  const columnEnd = spec.column + (spec.columnSpan ?? 1)
  return {
    rotation: spec.rotation,
    gridArea: `${spec.row} / ${spec.column} / ${rowEnd} / ${columnEnd}`,
  }
}

/**
 * The `facing` seat maps: players sit along the top and bottom edge the way the
 * two player table works, so life totals read horizontally. Seats in the top
 * row are flipped 180°, the bottom row stays upright.
 */
const FACING_SPECS: Record<PlayerCount, LayoutSpec> = {
  2: {
    columns: 1,
    rows: 2,
    seats: [
      { row: 1, column: 1, rotation: 180 },
      { row: 2, column: 1, rotation: 0 },
    ],
  },
  3: {
    columns: 2,
    rows: 2,
    seats: [
      { row: 1, column: 1, rotation: 180 },
      { row: 1, column: 2, rotation: 180 },
      { row: 2, column: 1, columnSpan: 2, rotation: 0 },
    ],
  },
  4: {
    columns: 2,
    rows: 2,
    seats: [
      { row: 1, column: 1, rotation: 180 },
      { row: 1, column: 2, rotation: 180 },
      { row: 2, column: 1, rotation: 0 },
      { row: 2, column: 2, rotation: 0 },
    ],
  },
  // Three across the top, two across the bottom; the sixth-column grid lets
  // the two rows use different seat widths without a gap.
  5: {
    columns: 6,
    rows: 2,
    seats: [
      { row: 1, column: 1, columnSpan: 2, rotation: 180 },
      { row: 1, column: 3, columnSpan: 2, rotation: 180 },
      { row: 1, column: 5, columnSpan: 2, rotation: 180 },
      { row: 2, column: 1, columnSpan: 3, rotation: 0 },
      { row: 2, column: 4, columnSpan: 3, rotation: 0 },
    ],
  },
  6: {
    columns: 3,
    rows: 2,
    seats: [
      { row: 1, column: 1, rotation: 180 },
      { row: 1, column: 2, rotation: 180 },
      { row: 1, column: 3, rotation: 180 },
      { row: 2, column: 1, rotation: 0 },
      { row: 2, column: 2, rotation: 0 },
      { row: 2, column: 3, rotation: 0 },
    ],
  },
}

/**
 * Rotation of a facing seat once the table is turned a quarter turn.
 *
 * A player reads the panel with its top pointing away from them, so somebody
 * at the left edge needs it turned 90° (top towards the right of the screen)
 * and somebody at the right edge 270°. The top row therefore becomes the left
 * column at 90°, and the bottom row the right column at 270°.
 */
const TURNED: Record<Rotation, Rotation> = { 0: 270, 90: 0, 180: 90, 270: 180 }

/**
 * `sides` is the facing table turned a quarter turn: rows become columns, the
 * top group moves to the left edge and the bottom group to the right edge.
 */
function turn(spec: LayoutSpec): LayoutSpec {
  return {
    columns: spec.rows,
    rows: spec.columns,
    seats: spec.seats.map((seat) => ({
      row: seat.column,
      column: seat.row,
      rowSpan: seat.columnSpan,
      columnSpan: seat.rowSpan,
      rotation: TURNED[seat.rotation],
    })),
  }
}

/**
 * `head` is the hybrid seating an odd player count falls into at a real table:
 * one player takes the head, the remaining even number splits between the two
 * long sides and faces across. The head seat spans the full width at 180° like
 * a `facing` top row; the side seats take the left and right edge rotations
 * (90° / 270°) the same way `sides` does.
 *
 * Seats run head first, then the left column top to bottom, then the right, to
 * match the order `sides` produces.
 */
const HEAD_SPECS: Partial<Record<PlayerCount, LayoutSpec>> = {
  3: {
    columns: 2,
    rows: 2,
    seats: [
      { row: 1, column: 1, columnSpan: 2, rotation: 180 },
      { row: 2, column: 1, rotation: 90 },
      { row: 2, column: 2, rotation: 270 },
    ],
  },
  5: {
    columns: 2,
    rows: 3,
    seats: [
      { row: 1, column: 1, columnSpan: 2, rotation: 180 },
      { row: 2, column: 1, rotation: 90 },
      { row: 3, column: 1, rotation: 90 },
      { row: 2, column: 2, rotation: 270 },
      { row: 3, column: 2, rotation: 270 },
    ],
  },
}

/** `stacked` puts every seat in its own upright row, for one-sided seating. */
function stacked(playerCount: PlayerCount): LayoutSpec {
  return {
    columns: 1,
    rows: playerCount,
    seats: Array.from({ length: playerCount }, (_, index) => ({
      row: index + 1,
      column: 1,
      rotation: 0 as Rotation,
    })),
  }
}

function specFor(playerCount: PlayerCount, layoutId: LayoutId): LayoutSpec {
  switch (layoutId) {
    case 'sides':
      return turn(FACING_SPECS[playerCount])
    case 'stacked':
      return stacked(playerCount)
    case 'head':
      return HEAD_SPECS[playerCount] ?? FACING_SPECS[playerCount]
    default:
      return FACING_SPECS[playerCount]
  }
}

export function clampPlayerCount(count: number): PlayerCount {
  if (!Number.isFinite(count)) return MIN_PLAYERS
  return Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Math.round(count))) as PlayerCount
}

/** Whether a layout has a seat map for this many players. */
export function supportsPlayerCount(layoutId: string, playerCount: number): boolean {
  const allowed = findLayout(layoutId).playerCounts
  return !allowed || allowed.includes(clampPlayerCount(playerCount))
}

/** The layouts worth offering at a given player count, in picker order. */
export function layoutsForPlayers(playerCount: number): LayoutDefinition[] {
  return TABLE_LAYOUTS.filter((layout) => supportsPlayerCount(layout.id, playerCount))
}

export function seatLayout(playerCount: number, layoutId: string = DEFAULT_LAYOUT_ID): SeatLayout {
  const spec = specFor(clampPlayerCount(playerCount), findLayout(layoutId).id)
  return {
    columns: spec.columns,
    rows: spec.rows,
    seats: spec.seats.map(toPlacement),
  }
}
