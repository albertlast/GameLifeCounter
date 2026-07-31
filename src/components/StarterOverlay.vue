<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import type { Player } from '../game/types'

defineProps<{ player: Player }>()

const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div
    class="starter"
    role="dialog"
    aria-modal="true"
    :aria-label="`${player.name} starts`"
    @click="emit('close')"
  >
    <div class="starter__card" :style="{ '--player-hue': player.hue }">
      <AppIcon name="crown" class="starter__crown" />
      <p class="starter__name">{{ player.name }}</p>
      <p class="starter__hint">starts the game — tap to dismiss</p>
    </div>
  </div>
</template>

<style scoped>
.starter {
  position: fixed;
  inset: 0;
  z-index: 45;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(4, 5, 9, 0.74);
  backdrop-filter: blur(10px);
  animation: fade var(--dur) var(--ease);
}

.starter__card {
  display: grid;
  place-items: center;
  gap: 6px;
  padding: 34px 46px;
  border: 1px solid hsl(var(--player-hue) 85% 65% / 0.5);
  border-radius: var(--radius-lg);
  background: linear-gradient(
    160deg,
    hsl(var(--player-hue) 80% 42%) 0%,
    hsl(var(--player-hue) 75% 24%) 100%
  );
  box-shadow: 0 30px 80px hsl(var(--player-hue) 90% 12% / 0.75);
  text-align: center;
  animation: pop var(--dur) var(--ease);
}

.starter__crown {
  font-size: 2.6rem;
  opacity: 0.9;
}

.starter__name {
  font-size: clamp(1.8rem, 9vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.starter__hint {
  font-size: 0.85rem;
  opacity: 0.75;
}

@keyframes fade {
  from {
    opacity: 0;
  }
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
}
</style>
