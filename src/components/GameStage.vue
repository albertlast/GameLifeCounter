<script setup lang="ts">
import { computed } from 'vue'
import PlayerSeat from './PlayerSeat.vue'
import PlayerPanel from './PlayerPanel.vue'
import { useGameStore } from '../game/inject'
import type { CounterKind } from '../game/types'

defineProps<{ firstPlayerId?: number | null }>()

const game = useGameStore()

/** Pairs each active player with the seat the current layout gives them. */
const seats = computed(() =>
  game.activePlayers.value.flatMap((player, index) => {
    const placement = game.layout.value.seats[index]
    return placement ? [{ player, placement }] : []
  }),
)

const onLife = (playerId: number, delta: number) => game.adjustLife(playerId, delta)
const onCounter = (playerId: number, kind: CounterKind, delta: number) =>
  game.adjustCounter(playerId, kind, delta)
</script>

<template>
  <div
    class="stage"
    :style="{
      gridTemplateColumns: `repeat(${game.layout.value.columns}, 1fr)`,
      gridTemplateRows: `repeat(${game.layout.value.rows}, 1fr)`,
    }"
  >
    <PlayerSeat v-for="{ player, placement } in seats" :key="player.id" :placement="placement">
      <PlayerPanel
        :player="player"
        :counters="game.counters.value"
        :step="game.preset.value.step"
        :big-step="game.preset.value.bigStep"
        :is-first-player="firstPlayerId === player.id"
        @life="(delta) => onLife(player.id, delta)"
        @counter="(kind, delta) => onCounter(player.id, kind, delta)"
      />
    </PlayerSeat>
  </div>
</template>

<style scoped>
.stage {
  display: grid;
  gap: var(--stage-gap);
  width: 100%;
  height: 100%;
  padding: calc(var(--stage-pad) + var(--safe-top)) calc(var(--stage-pad) + var(--safe-right))
    calc(var(--stage-pad) + var(--safe-bottom)) calc(var(--stage-pad) + var(--safe-left));
  background: var(--stage-bg);
  transition:
    gap var(--dur) var(--ease),
    padding var(--dur) var(--ease);
}
</style>
