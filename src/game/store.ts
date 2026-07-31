import { computed, reactive, readonly } from 'vue'
import type { CounterKind, GameState, Player } from './types'
import { MAX_PLAYERS } from './types'
import { DEFAULT_PRESET_ID, findPreset } from './presets'
import {
  DEFAULT_LAYOUT_ID,
  clampPlayerCount,
  findLayout,
  isLayoutId,
  seatLayout,
  supportsPlayerCount,
} from './layouts'
import { DEFAULT_THEME_ID, isThemeId } from '../theme/themes'
import { STORAGE_KEY, clearLegacyState, readJson, readLegacyState, writeJson } from './storage'

export const DEFAULT_HUES = [32, 222, 145, 305, 355, 265]

function defaultPlayer(index: number, life: number): Player {
  return {
    id: index,
    name: `Player ${index + 1}`,
    hue: DEFAULT_HUES[index] ?? 0,
    life,
    counters: { poison: 0, energy: 0 },
  }
}

function toFiniteNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : fallback
}

function normaliseHue(value: unknown, fallback: number): number {
  const hue = toFiniteNumber(value, fallback)
  return ((Math.round(hue) % 360) + 360) % 360
}

function defaultState(): GameState {
  const preset = findPreset(DEFAULT_PRESET_ID)
  return {
    presetId: preset.id,
    themeId: DEFAULT_THEME_ID,
    layoutId: DEFAULT_LAYOUT_ID,
    playerCount: 2,
    startingLife: preset.startingLife,
    players: Array.from({ length: MAX_PLAYERS }, (_, index) =>
      defaultPlayer(index, preset.startingLife),
    ),
  }
}

/** Rebuilds a trustworthy state object from whatever was persisted. */
export function sanitizeState(raw: Partial<GameState> | null): GameState {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base

  const preset = findPreset(typeof raw.presetId === 'string' ? raw.presetId : base.presetId)
  const startingLife = Math.round(toFiniteNumber(raw.startingLife, preset.startingLife))
  const storedPlayers = Array.isArray(raw.players) ? raw.players : []
  const playerCount = clampPlayerCount(toFiniteNumber(raw.playerCount, base.playerCount))
  const storedLayout = isLayoutId(raw.layoutId) ? raw.layoutId : base.layoutId

  return {
    presetId: preset.id,
    themeId: isThemeId(raw.themeId) ? raw.themeId : base.themeId,
    layoutId: supportsPlayerCount(storedLayout, playerCount) ? storedLayout : base.layoutId,
    playerCount,
    startingLife,
    players: Array.from({ length: MAX_PLAYERS }, (_, index) => {
      const fallback = defaultPlayer(index, startingLife)
      const stored = storedPlayers[index] as Partial<Player> | undefined
      if (!stored || typeof stored !== 'object') return fallback
      return {
        id: index,
        name:
          typeof stored.name === 'string' && stored.name.trim().length > 0
            ? stored.name.slice(0, 24)
            : fallback.name,
        hue: normaliseHue(stored.hue, fallback.hue),
        life: Math.round(toFiniteNumber(stored.life, fallback.life)),
        counters: {
          poison: Math.max(0, Math.round(toFiniteNumber(stored.counters?.poison, 0))),
          energy: Math.max(0, Math.round(toFiniteNumber(stored.counters?.energy, 0))),
        },
      }
    }),
  }
}

function loadState(): GameState {
  const stored = readJson<Partial<GameState>>(STORAGE_KEY)
  if (stored) return sanitizeState(stored)

  const legacy = readLegacyState()
  if (!legacy) return defaultState()

  // One-off upgrade from the two-player release.
  const migrated = defaultState()
  legacy.lives.forEach((life, index) => {
    const player = migrated.players[index]
    if (player) player.life = Math.round(life)
  })
  legacy.hues.forEach((hue, index) => {
    const player = migrated.players[index]
    if (player) player.hue = normaliseHue(hue, player.hue)
  })
  clearLegacyState()
  return migrated
}

export function createGameStore(initial?: Partial<GameState>) {
  const state = reactive<GameState>(initial ? sanitizeState(initial) : loadState())

  const persist = () => writeJson(STORAGE_KEY, state)

  const preset = computed(() => findPreset(state.presetId))
  const activePlayers = computed(() => state.players.slice(0, state.playerCount))
  const tableLayout = computed(() => findLayout(state.layoutId))
  const layout = computed(() => seatLayout(state.playerCount, state.layoutId))
  const counters = computed<CounterKind[]>(() => preset.value.counters)

  const playerAt = (id: number): Player | undefined =>
    state.players.find((player) => player.id === id)

  const adjustLife = (id: number, delta: number) => {
    const player = playerAt(id)
    if (!player || !Number.isFinite(delta)) return
    player.life = Math.round(player.life + delta)
    persist()
  }

  const setLife = (id: number, life: number) => {
    const player = playerAt(id)
    if (!player || !Number.isFinite(life)) return
    player.life = Math.round(life)
    persist()
  }

  const adjustCounter = (id: number, kind: CounterKind, delta: number) => {
    const player = playerAt(id)
    if (!player || !Number.isFinite(delta)) return
    player.counters[kind] = Math.max(0, Math.round(player.counters[kind] + delta))
    persist()
  }

  const setHue = (id: number, hue: number) => {
    const player = playerAt(id)
    if (!player) return
    player.hue = normaliseHue(hue, player.hue)
    persist()
  }

  const setName = (id: number, name: string) => {
    const player = playerAt(id)
    if (!player) return
    const trimmed = name.trim()
    player.name = trimmed.length > 0 ? trimmed.slice(0, 24) : `Player ${id + 1}`
    persist()
  }

  const setPlayerCount = (count: number) => {
    state.playerCount = clampPlayerCount(count)
    // `head` only seats 3 or 5, so leaving it selected would silently render
    // something else. Drop back to the default rather than lie about it.
    if (!supportsPlayerCount(state.layoutId, state.playerCount)) {
      state.layoutId = DEFAULT_LAYOUT_ID
    }
    persist()
  }

  const setStartingLife = (life: number) => {
    if (!Number.isFinite(life)) return
    state.startingLife = Math.round(life)
    persist()
  }

  /** Puts every player back to the starting life and clears their counters. */
  const resetGame = () => {
    state.players.forEach((player) => {
      player.life = state.startingLife
      player.counters.poison = 0
      player.counters.energy = 0
    })
    persist()
  }

  const applyPreset = (presetId: string) => {
    const next = findPreset(presetId)
    state.presetId = next.id
    state.startingLife = next.startingLife
    resetGame()
  }

  const setTheme = (themeId: string) => {
    if (!isThemeId(themeId)) return
    state.themeId = themeId
    persist()
  }

  const setLayout = (layoutId: string) => {
    if (!isLayoutId(layoutId) || !supportsPlayerCount(layoutId, state.playerCount)) return
    state.layoutId = layoutId
    persist()
  }

  const resetColors = () => {
    state.players.forEach((player, index) => {
      player.hue = DEFAULT_HUES[index] ?? 0
    })
    persist()
  }

  /** Returns the id of a randomly chosen starting player. */
  const randomFirstPlayer = (random: () => number = Math.random): number => {
    const seats = activePlayers.value
    // Math.random() is [0, 1) but a stubbed one may return exactly 1.
    const index = Math.min(Math.max(0, Math.floor(random() * seats.length)), seats.length - 1)
    return seats[index]?.id ?? 0
  }

  return {
    state: readonly(state),
    preset,
    activePlayers,
    layout,
    tableLayout,
    counters,
    playerAt,
    adjustLife,
    setLife,
    adjustCounter,
    setHue,
    setName,
    setPlayerCount,
    setStartingLife,
    resetGame,
    applyPreset,
    setTheme,
    setLayout,
    resetColors,
    randomFirstPlayer,
    persist,
  }
}

export type GameStore = ReturnType<typeof createGameStore>

let singleton: GameStore | null = null

export function useGame(): GameStore {
  if (!singleton) singleton = createGameStore()
  return singleton
}

/** Test seam: drops the shared store so the next `useGame()` rebuilds it. */
export function resetGameStore(): void {
  singleton = null
}
