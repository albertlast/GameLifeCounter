<script setup lang="ts">
import { computed } from 'vue'
import { seatLayout } from '../game/layouts'
import { DEFAULT_HUES } from '../game/store'

const { playerCount, layoutId } = defineProps<{
  playerCount: number
  layoutId: string
}>()

/** The edge a player sits at, which is where their seat marker goes. */
const EDGE: Record<number, string> = { 0: 'bottom', 90: 'left', 180: 'top', 270: 'right' }

const layout = computed(() => seatLayout(playerCount, layoutId))
</script>

<template>
  <div
    class="preview"
    :style="{
      gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
      gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
    }"
    aria-hidden="true"
  >
    <span
      v-for="(seat, index) in layout.seats"
      :key="index"
      class="preview__seat"
      :data-edge="EDGE[seat.rotation]"
      :style="{ gridArea: seat.gridArea, '--seat-hue': DEFAULT_HUES[index] ?? 0 }"
    />
  </div>
</template>

<style scoped>
.preview {
  display: grid;
  gap: 2px;
  width: 46px;
  height: 58px;
  padding: 2px;
  border: 1px solid var(--chrome-border);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.3);
}

.preview__seat {
  position: relative;
  border-radius: 2px;
  background: hsl(var(--seat-hue, 0) 70% 50% / 0.5);
}

/* The bar marks the edge that player sits at. */
.preview__seat::after {
  content: '';
  position: absolute;
  background: hsl(var(--seat-hue, 0) 85% 68%);
  border-radius: 2px;
}

.preview__seat[data-edge='bottom']::after {
  inset: auto 15% 1px;
  height: 2px;
}

.preview__seat[data-edge='top']::after {
  inset: 1px 15% auto;
  height: 2px;
}

.preview__seat[data-edge='left']::after {
  inset: 15% auto 15% 1px;
  width: 2px;
}

.preview__seat[data-edge='right']::after {
  inset: 15% 1px 15% auto;
  width: 2px;
}
</style>
