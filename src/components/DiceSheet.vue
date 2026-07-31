<script setup lang="ts">
import { computed } from 'vue'
import OverlaySheet from './OverlaySheet.vue'
import { DICE_SIDES, useDice } from '../composables/useDice'

const emit = defineEmits<{ (e: 'close'): void }>()

const dice = useDice()

const dieLabel = (sides: number) => (sides === 2 ? 'Coin' : `d${sides}`)

const resultLabel = computed(() => {
  const roll = dice.last.value
  if (!roll) return '—'
  if (roll.sides === 2) return roll.value === 1 ? 'Heads' : 'Tails'
  return roll.value.toString()
})

const resultHint = computed(() => {
  const roll = dice.last.value
  return roll ? `${dieLabel(roll.sides)} · 1–${roll.sides}` : 'Pick a die'
})
</script>

<template>
  <OverlaySheet title="Dice" subtitle="Settle it with a roll" @close="emit('close')">
    <div class="result" :class="{ 'result--rolling': dice.rolling.value }" role="status">
      <p class="result__value">{{ resultLabel }}</p>
      <p class="result__hint">{{ resultHint }}</p>
    </div>

    <div class="dice">
      <button
        v-for="sides in DICE_SIDES"
        :key="sides"
        class="die"
        type="button"
        @click="dice.roll(sides)"
      >
        {{ dieLabel(sides) }}
      </button>
    </div>

    <div v-if="dice.history.value.length > 1" class="history">
      <span class="history__label">Recent</span>
      <span
        v-for="(roll, index) in dice.history.value.slice(1)"
        :key="`${index}-${roll.sides}-${roll.value}`"
        class="history__item"
      >
        {{ dieLabel(roll.sides) }}: {{ roll.value }}
      </span>
    </div>
  </OverlaySheet>
</template>

<style scoped>
.result {
  display: grid;
  place-items: center;
  gap: 4px;
  padding: 26px 0 22px;
  transition: transform var(--dur) var(--ease);
}

.result--rolling {
  transform: scale(1.06);
}

.result__value {
  font-size: clamp(3rem, 18vw, 5rem);
  font-weight: 200;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
  line-height: 1;
}

.result__hint {
  color: var(--chrome-muted);
  font-size: 0.85rem;
}

.dice {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.die {
  padding: 16px 0;
  border: 1px solid var(--chrome-border);
  border-radius: var(--radius-md);
  background: var(--chrome-raised);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  transition:
    transform var(--dur-fast) var(--ease),
    background var(--dur-fast) var(--ease);
}

.die:active {
  background: var(--accent);
  color: var(--accent-contrast);
  transform: scale(0.95);
}

.history {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  color: var(--chrome-muted);
  font-size: 0.8rem;
}

.history__label {
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.history__item {
  padding: 4px 9px;
  border: 1px solid var(--chrome-border);
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}
</style>
