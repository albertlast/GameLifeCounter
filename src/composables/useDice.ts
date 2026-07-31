import { ref } from 'vue'

export const DICE_SIDES = [2, 4, 6, 8, 10, 12, 20, 100] as const
export type DiceSides = (typeof DICE_SIDES)[number]

export interface DiceRoll {
  sides: number
  value: number
}

export function rollDie(sides: number, random: () => number = Math.random): number {
  const faces = Math.max(2, Math.floor(sides))
  return Math.min(faces, Math.floor(random() * faces) + 1)
}

export function useDice(random: () => number = Math.random) {
  const last = ref<DiceRoll | null>(null)
  const history = ref<DiceRoll[]>([])
  const rolling = ref(false)
  let settleId: ReturnType<typeof setTimeout> | null = null

  const roll = (sides: number): DiceRoll => {
    const result: DiceRoll = { sides, value: rollDie(sides, random) }
    last.value = result
    history.value = [result, ...history.value].slice(0, 8)

    rolling.value = true
    if (settleId !== null) clearTimeout(settleId)
    settleId = setTimeout(() => {
      rolling.value = false
    }, 320)

    return result
  }

  const clear = () => {
    last.value = null
    history.value = []
  }

  return { last, history, rolling, roll, clear }
}
