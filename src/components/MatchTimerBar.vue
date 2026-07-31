<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { useMatchTimer } from '../composables/useMatchTimer'

const emit = defineEmits<{ (e: 'close'): void }>()

const timer = useMatchTimer()
</script>

<template>
  <div class="timer" role="timer" :aria-label="`Match time ${timer.label.value}`">
    <button
      class="timer__button"
      type="button"
      :aria-label="timer.running.value ? 'Pause timer' : 'Start timer'"
      @click="timer.toggle()"
    >
      <span class="timer__glyph" :data-running="timer.running.value" />
    </button>
    <output class="timer__value">{{ timer.label.value }}</output>
    <button class="timer__button" type="button" aria-label="Reset timer" @click="timer.reset()">
      <AppIcon name="refresh" />
    </button>
    <button class="timer__button" type="button" aria-label="Hide timer" @click="emit('close')">
      <AppIcon name="close" />
    </button>
  </div>
</template>

<style scoped>
.timer {
  position: fixed;
  top: calc(10px + var(--safe-top));
  left: 50%;
  z-index: 25;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--chrome-border);
  border-radius: 999px;
  background: var(--chrome-bg);
  box-shadow: var(--chrome-shadow);
  color: var(--chrome-fg);
  transform: translateX(-50%);
}

.timer__value {
  min-width: 4.6ch;
  font-size: 1.05rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.timer__button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  font-size: 1.05rem;
  opacity: 0.8;
}

.timer__button:active {
  background: var(--chrome-raised);
}

/* Play triangle that becomes a pause bar pair while running. */
.timer__glyph {
  width: 0;
  height: 0;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 11px solid currentColor;
}

.timer__glyph[data-running='true'] {
  width: 11px;
  height: 13px;
  border: 0;
  background: linear-gradient(
    to right,
    currentColor 0 4px,
    transparent 4px 7px,
    currentColor 7px 11px
  );
}
</style>
