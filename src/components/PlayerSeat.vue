<script setup lang="ts">
import type { SeatPlacement } from '../game/types'

defineProps<{ placement: SeatPlacement }>()
</script>

<template>
  <div class="seat" :style="{ gridArea: placement.gridArea }" :data-rotation="placement.rotation">
    <div class="seat__inner">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/*
  A seat is a cell of the table grid, rotated so the panel reads upright from
  where that player sits. In the `sides` layout a seat turns a quarter turn, so
  its panel has to swap width and height — `cqh`/`cqw` take both straight from
  the seat box.
*/
.seat {
  position: relative;
  container-type: size;
  overflow: hidden;
  border-radius: var(--panel-radius);
}

.seat__inner {
  position: absolute;
  top: 50%;
  left: 50%;
  container-type: size;
  transform-origin: center;
}

.seat[data-rotation='0'] .seat__inner,
.seat[data-rotation='180'] .seat__inner {
  width: 100%;
  height: 100%;
}

.seat[data-rotation='90'] .seat__inner,
.seat[data-rotation='270'] .seat__inner {
  width: 100cqh;
  height: 100cqw;
}

.seat[data-rotation='0'] .seat__inner {
  transform: translate(-50%, -50%);
}

.seat[data-rotation='90'] .seat__inner {
  transform: translate(-50%, -50%) rotate(90deg);
}

.seat[data-rotation='180'] .seat__inner {
  transform: translate(-50%, -50%) rotate(180deg);
}

.seat[data-rotation='270'] .seat__inner {
  transform: translate(-50%, -50%) rotate(-90deg);
}
</style>
