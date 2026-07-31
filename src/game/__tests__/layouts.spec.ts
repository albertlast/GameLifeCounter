import { describe, expect, it } from 'vitest'
import {
  TABLE_LAYOUTS,
  clampPlayerCount,
  findLayout,
  isLayoutId,
  layoutsForPlayers,
  seatLayout,
  supportsPlayerCount,
} from '../layouts'
import { MAX_PLAYERS, MIN_PLAYERS } from '../types'

describe('clampPlayerCount', () => {
  it('keeps counts inside the supported range', () => {
    expect(clampPlayerCount(1)).toBe(MIN_PLAYERS)
    expect(clampPlayerCount(7)).toBe(MAX_PLAYERS)
    expect(clampPlayerCount(3.4)).toBe(3)
    expect(clampPlayerCount(Number.NaN)).toBe(MIN_PLAYERS)
  })
})

describe('seatLayout', () => {
  it('provides one seat per player for every supported count', () => {
    for (let count = MIN_PLAYERS; count <= MAX_PLAYERS; count += 1) {
      expect(seatLayout(count).seats).toHaveLength(count)
    }
  })

  it('faces two players at each other across the device', () => {
    const layout = seatLayout(2)

    expect(layout).toMatchObject({ columns: 1, rows: 2 })
    expect(layout.seats.map((seat) => seat.rotation)).toEqual([180, 0])
    expect(layout.seats[0].gridArea).toBe('1 / 1 / 2 / 2')
  })

  it('gives the third player the full bottom row', () => {
    const layout = seatLayout(3)

    expect(layout.seats[2].gridArea).toBe('2 / 1 / 3 / 3')
    expect(layout.seats[2].rotation).toBe(0)
  })

  it('seats everyone at the top or bottom edge, never sideways', () => {
    for (let count = MIN_PLAYERS; count <= MAX_PLAYERS; count += 1) {
      const rotations = seatLayout(count).seats.map((seat) => seat.rotation)
      expect(rotations.every((rotation) => rotation === 0 || rotation === 180)).toBe(true)
    }
  })

  it('splits five and six players into a facing top and bottom row', () => {
    expect(seatLayout(6)).toMatchObject({ columns: 3, rows: 2 })
    expect(seatLayout(6).seats.map((seat) => seat.rotation)).toEqual([180, 180, 180, 0, 0, 0])

    // Three across the top, two wider seats across the bottom.
    expect(seatLayout(5).seats.map((seat) => seat.rotation)).toEqual([180, 180, 180, 0, 0])
    expect(seatLayout(5).seats[3].gridArea).toBe('2 / 1 / 3 / 4')
    expect(seatLayout(5).seats[4].gridArea).toBe('2 / 4 / 3 / 7')
  })

  it('puts the top row first so seat order runs around the table', () => {
    for (let count = MIN_PLAYERS; count <= MAX_PLAYERS; count += 1) {
      const seats = seatLayout(count).seats
      expect(seats[0].rotation, `players=${count}`).toBe(180)
      expect(seats[seats.length - 1].rotation, `players=${count}`).toBe(0)
    }
  })

  it('falls back to the facing layout for an unknown id', () => {
    expect(seatLayout(4, 'nonsense')).toEqual(seatLayout(4, 'facing'))
  })

  it('fills the grid without gaps or overlaps, in every layout', () => {
    for (const layoutId of TABLE_LAYOUTS.map((entry) => entry.id)) {
      for (let count = MIN_PLAYERS; count <= MAX_PLAYERS; count += 1) {
        const layout = seatLayout(count, layoutId)
        const where = `${layoutId}/${count}`
        const cells = new Set<string>()

        expect(layout.seats, where).toHaveLength(count)

        for (const seat of layout.seats) {
          const [rowStart, colStart, rowEnd, colEnd] = seat.gridArea
            .split('/')
            .map((part) => Number.parseInt(part.trim(), 10))

          for (let row = rowStart; row < rowEnd; row += 1) {
            for (let col = colStart; col < colEnd; col += 1) {
              const key = `${row}:${col}`
              expect(cells.has(key), `${where} cell ${key} used twice`).toBe(false)
              cells.add(key)
            }
          }
        }

        expect(cells.size, where).toBe(layout.rows * layout.columns)
      }
    }
  })
})

describe('table layouts', () => {
  it('offers facing, sides, head and same-side seating', () => {
    expect(TABLE_LAYOUTS.map((layout) => layout.id)).toEqual(['facing', 'sides', 'head', 'stacked'])
    expect(isLayoutId('sides')).toBe(true)
    expect(isLayoutId('diagonal')).toBe(false)
    expect(findLayout('diagonal').id).toBe('facing')
  })

  it('turns the facing table a quarter turn for side seating', () => {
    const facing = seatLayout(6, 'facing')
    const sides = seatLayout(6, 'sides')

    expect(sides).toMatchObject({ columns: facing.rows, rows: facing.columns })
    expect(sides.seats.map((seat) => seat.rotation)).toEqual([90, 90, 90, 270, 270, 270])
    expect(seatLayout(2, 'sides').seats.map((seat) => seat.rotation)).toEqual([90, 270])
  })

  /**
   * The panel's top points away from its player: 90° for somebody at the left
   * edge, 270° at the right. Getting these the wrong way round leaves both
   * columns readable only upside down.
   */
  it('turns left-column seats to 90° and right-column seats to 270°', () => {
    for (let count = MIN_PLAYERS; count <= MAX_PLAYERS; count += 1) {
      for (const seat of seatLayout(count, 'sides').seats) {
        const column = Number.parseInt(seat.gridArea.split('/')[1]!.trim(), 10)
        expect(seat.rotation, `players=${count} column=${column}`).toBe(column === 1 ? 90 : 270)
      }
    }
  })

  it('keeps the uneven split when turned', () => {
    // Three seats down the left edge, two down the right.
    expect(seatLayout(5, 'sides').seats.map((seat) => seat.rotation)).toEqual([
      90, 90, 90, 270, 270,
    ])
    expect(seatLayout(5, 'sides')).toMatchObject({ columns: 2, rows: 6 })
  })

  /**
   * The hybrid an odd count falls into at a real table: one player at the head,
   * the even remainder facing each other across the two long sides.
   */
  it('seats one player at the head and faces the rest across the sides', () => {
    const three = seatLayout(3, 'head')
    expect(three).toMatchObject({ columns: 2, rows: 2 })
    expect(three.seats.map((seat) => seat.rotation)).toEqual([180, 90, 270])
    // The head seat spans the full width of the table.
    expect(three.seats[0].gridArea).toBe('1 / 1 / 2 / 3')

    const five = seatLayout(5, 'head')
    expect(five).toMatchObject({ columns: 2, rows: 3 })
    expect(five.seats.map((seat) => seat.rotation)).toEqual([180, 90, 90, 270, 270])
    expect(five.seats[0].gridArea).toBe('1 / 1 / 2 / 3')
  })

  it('splits the side seats evenly, left column then right', () => {
    for (const count of [3, 5]) {
      const sideSeats = seatLayout(count, 'head').seats.slice(1)
      const left = sideSeats.filter((seat) => seat.rotation === 90)
      const right = sideSeats.filter((seat) => seat.rotation === 270)

      expect(left, `players=${count}`).toHaveLength((count - 1) / 2)
      expect(right, `players=${count}`).toHaveLength((count - 1) / 2)

      for (const seat of sideSeats) {
        const column = Number.parseInt(seat.gridArea.split('/')[1]!.trim(), 10)
        expect(seat.rotation, `players=${count} column=${column}`).toBe(column === 1 ? 90 : 270)
      }
    }
  })

  it('offers the head layout only where the remainder splits evenly', () => {
    expect(layoutsForPlayers(3).map((layout) => layout.id)).toContain('head')
    expect(layoutsForPlayers(5).map((layout) => layout.id)).toContain('head')

    for (const count of [2, 4, 6]) {
      expect(
        layoutsForPlayers(count).map((layout) => layout.id),
        `players=${count}`,
      ).not.toContain('head')
      expect(supportsPlayerCount('head', count), `players=${count}`).toBe(false)
      // Falls back rather than rendering a seat map it does not have.
      expect(seatLayout(count, 'head'), `players=${count}`).toEqual(seatLayout(count, 'facing'))
    }
  })

  it('offers every other layout at every count', () => {
    for (let count = MIN_PLAYERS; count <= MAX_PLAYERS; count += 1) {
      for (const id of ['facing', 'sides', 'stacked']) {
        expect(supportsPlayerCount(id, count), `${id}/${count}`).toBe(true)
      }
    }
  })

  it('stacks every seat upright for one-sided seating', () => {
    for (let count = MIN_PLAYERS; count <= MAX_PLAYERS; count += 1) {
      const layout = seatLayout(count, 'stacked')

      expect(layout).toMatchObject({ columns: 1, rows: count })
      expect(layout.seats.every((seat) => seat.rotation === 0)).toBe(true)
    }
  })
})
