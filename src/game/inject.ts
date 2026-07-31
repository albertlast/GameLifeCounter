import { inject, type InjectionKey } from 'vue'
import { useGame, type GameStore } from './store'

export const GAME_STORE_KEY: InjectionKey<GameStore> = Symbol('glc.game')

/**
 * Components resolve the store through injection so tests can mount them
 * with an isolated store; falls back to the shared app store.
 */
export function useGameStore(): GameStore {
  return inject(GAME_STORE_KEY, null) ?? useGame()
}
