import { describe, expect, it } from 'vitest'
import { createGameStore, sanitizeState, useGame, DEFAULT_HUES } from '../store'
import { STORAGE_KEY } from '../storage'
import { findPreset } from '../presets'
import type { GameState } from '../types'

const readPersisted = (): GameState => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')

describe('game store defaults', () => {
  it('starts a two player standard game', () => {
    const game = createGameStore()

    expect(game.state.playerCount).toBe(2)
    expect(game.state.presetId).toBe('standard')
    expect(game.state.themeId).toBe('pulse')
    expect(game.state.startingLife).toBe(20)
    expect(game.activePlayers.value).toHaveLength(2)
    expect(game.activePlayers.value.map((player) => player.life)).toEqual([20, 20])
    expect(game.activePlayers.value.map((player) => player.hue)).toEqual(DEFAULT_HUES.slice(0, 2))
  })

  it('keeps six players in memory so seats remember their name and colour', () => {
    const game = createGameStore()
    game.setName(4, 'Ada')
    game.setPlayerCount(6)

    expect(game.activePlayers.value).toHaveLength(6)
    expect(game.activePlayers.value[4].name).toBe('Ada')
  })
})

describe('life and counters', () => {
  it('adds and removes life, including below zero', () => {
    const game = createGameStore()

    game.adjustLife(0, -5)
    game.adjustLife(0, -20)

    expect(game.playerAt(0)?.life).toBe(-5)
  })

  it('ignores life changes for unknown players and invalid deltas', () => {
    const game = createGameStore()

    game.adjustLife(99, 5)
    game.adjustLife(0, Number.NaN)

    expect(game.playerAt(0)?.life).toBe(20)
  })

  it('never lets a counter drop below zero', () => {
    const game = createGameStore()

    game.adjustCounter(1, 'poison', 3)
    game.adjustCounter(1, 'poison', -10)

    expect(game.playerAt(1)?.counters.poison).toBe(0)
  })
})

describe('presets and new games', () => {
  it('applying a preset sets the life total and restarts', () => {
    const game = createGameStore()
    game.adjustLife(0, -12)

    game.applyPreset('commander')

    expect(game.state.presetId).toBe('commander')
    expect(game.state.startingLife).toBe(40)
    expect(game.counters.value).toEqual(['poison'])
    expect(game.activePlayers.value.every((player) => player.life === 40)).toBe(true)
  })

  it('falls back to the standard preset for unknown ids', () => {
    expect(findPreset('nope').id).toBe('standard')
  })

  it('resetting clears life and counters for every seat', () => {
    const game = createGameStore()
    game.setStartingLife(30)
    game.adjustLife(0, -9)
    game.adjustCounter(0, 'poison', 4)
    game.adjustCounter(1, 'energy', 2)

    game.resetGame()

    expect(game.state.players.every((player) => player.life === 30)).toBe(true)
    expect(game.state.players.every((player) => player.counters.poison === 0)).toBe(true)
    expect(game.state.players.every((player) => player.counters.energy === 0)).toBe(true)
  })
})

describe('table configuration', () => {
  it('clamps the player count to the supported range', () => {
    const game = createGameStore()

    game.setPlayerCount(99)
    expect(game.state.playerCount).toBe(6)

    game.setPlayerCount(0)
    expect(game.state.playerCount).toBe(2)
  })

  it('wraps hues into 0-359 and trims names', () => {
    const game = createGameStore()

    game.setHue(0, 400)
    game.setHue(1, -30)
    game.setName(0, '  Bo  ')
    game.setName(1, '   ')

    expect(game.playerAt(0)?.hue).toBe(40)
    expect(game.playerAt(1)?.hue).toBe(330)
    expect(game.playerAt(0)?.name).toBe('Bo')
    expect(game.playerAt(1)?.name).toBe('Player 2')
  })

  it('restores the default colours', () => {
    const game = createGameStore()
    game.setHue(0, 111)

    game.resetColors()

    expect(game.playerAt(0)?.hue).toBe(DEFAULT_HUES[0])
  })

  it('remembers the table layout and rejects unknown ones', () => {
    const game = createGameStore()

    expect(game.state.layoutId).toBe('facing')

    game.setLayout('sides')
    expect(game.state.layoutId).toBe('sides')
    expect(game.tableLayout.value.name).toBe('Sides')
    expect(game.layout.value.seats[0].rotation).toBe(90)

    game.setLayout('diagonal')
    expect(game.state.layoutId).toBe('sides')
  })

  it('keeps the layout when the player count changes', () => {
    const game = createGameStore()
    game.setLayout('stacked')

    game.setPlayerCount(5)

    expect(game.state.layoutId).toBe('stacked')
    expect(game.layout.value.seats).toHaveLength(5)
  })

  it('only accepts known themes', () => {
    const game = createGameStore()

    game.setTheme('arena')
    expect(game.state.themeId).toBe('arena')

    game.setTheme('hot-pink')
    expect(game.state.themeId).toBe('arena')
  })

  it('picks a first player inside the active seats', () => {
    const game = createGameStore()
    game.setPlayerCount(4)

    expect(game.randomFirstPlayer(() => 0)).toBe(0)
    expect(game.randomFirstPlayer(() => 0.99)).toBe(3)
    // Guards against a random() that returns exactly 1.
    expect(game.randomFirstPlayer(() => 1)).toBe(3)
  })
})

describe('persistence', () => {
  it('writes every change to local storage', () => {
    const game = createGameStore()

    game.adjustLife(0, -3)
    game.setPlayerCount(5)

    const stored = readPersisted()
    expect(stored.playerCount).toBe(5)
    expect(stored.players[0].life).toBe(17)
  })

  it('restores a stored game on the next visit', () => {
    const first = createGameStore()
    first.applyPreset('commander')
    first.setPlayerCount(3)
    first.adjustLife(2, -7)

    const second = createGameStore(JSON.parse(localStorage.getItem(STORAGE_KEY)!))

    expect(second.state.playerCount).toBe(3)
    expect(second.state.presetId).toBe('commander')
    expect(second.playerAt(2)?.life).toBe(33)
  })

  it('migrates the two player data written by the old version', () => {
    localStorage.setItem('glcfirst.life', '13')
    localStorage.setItem('glcsecond.life', '7')
    localStorage.setItem('glcP1Hue.Color', '99')
    localStorage.setItem('glcP2Hue.Color', '250')

    const game = useGame()

    expect(game.playerAt(0)?.life).toBe(13)
    expect(game.playerAt(1)?.life).toBe(7)
    expect(game.playerAt(0)?.hue).toBe(99)
    expect(game.playerAt(1)?.hue).toBe(250)
    expect(localStorage.getItem('glcfirst.life')).toBeNull()
  })

  it('survives corrupted storage', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')

    const game = useGame()

    expect(game.state.playerCount).toBe(2)
    expect(game.playerAt(0)?.life).toBe(20)
  })
})

describe('sanitizeState', () => {
  it('repairs partial and out-of-range values', () => {
    const state = sanitizeState({
      presetId: 'unknown',
      themeId: 'nope',
      layoutId: 'sideways',
      playerCount: 42,
      startingLife: Number.NaN,
      players: [{ name: '', hue: 720, life: 8.6, counters: { poison: -4 } }],
    } as never)

    expect(state.presetId).toBe('standard')
    expect(state.themeId).toBe('pulse')
    expect(state.layoutId).toBe('facing')
    expect(state.playerCount).toBe(6)
    expect(state.startingLife).toBe(20)
    expect(state.players).toHaveLength(6)
    expect(state.players[0]).toMatchObject({
      name: 'Player 1',
      hue: 0,
      life: 9,
      counters: { poison: 0, energy: 0 },
    })
  })

  it('returns defaults for anything that is not an object', () => {
    expect(sanitizeState(null).playerCount).toBe(2)
  })
})
