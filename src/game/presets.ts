import type { GamePreset } from './types'

export const GAME_PRESETS: GamePreset[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Duel life total, single steps.',
    startingLife: 20,
    step: 1,
    bigStep: 10,
    counters: [],
  },
  {
    id: 'commander',
    name: 'Commander',
    description: 'Multiplayer life total with poison.',
    startingLife: 40,
    step: 1,
    bigStep: 10,
    counters: ['poison'],
  },
  {
    id: 'energy',
    name: 'Energy',
    description: 'Life plus poison and energy counters.',
    startingLife: 20,
    step: 1,
    bigStep: 10,
    counters: ['poison', 'energy'],
  },
  {
    id: 'duel8000',
    name: 'Duel 8000',
    description: 'Large life pool, steps of 50.',
    startingLife: 8000,
    step: 50,
    bigStep: 500,
    counters: [],
  },
  {
    id: 'board',
    name: 'Board game',
    description: 'Neutral counter starting at zero.',
    startingLife: 0,
    step: 1,
    bigStep: 10,
    counters: [],
  },
]

export const DEFAULT_PRESET_ID = 'standard'

export function findPreset(id: string): GamePreset {
  return (
    GAME_PRESETS.find((preset) => preset.id === id) ??
    GAME_PRESETS.find((preset) => preset.id === DEFAULT_PRESET_ID)!
  )
}
