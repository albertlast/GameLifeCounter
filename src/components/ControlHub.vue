<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import type { IconName } from './AppIcon.vue'

export type HubAction = 'reset' | 'dice' | 'timer' | 'starter' | 'settings'

const emit = defineEmits<{ (e: 'action', action: HubAction): void }>()

const open = ref(false)

const actions: { id: HubAction; icon: IconName; label: string }[] = [
  { id: 'settings', icon: 'settings', label: 'Settings' },
  { id: 'dice', icon: 'dice', label: 'Roll dice' },
  { id: 'timer', icon: 'timer', label: 'Match timer' },
  { id: 'starter', icon: 'shuffle', label: 'Random first player' },
  { id: 'reset', icon: 'refresh', label: 'New game' },
]

const angleFor = (index: number) => (360 / actions.length) * index - 90

const run = (action: HubAction) => {
  open.value = false
  emit('action', action)
}
</script>

<template>
  <div class="hub" :data-open="open ? 'true' : 'false'">
    <div v-if="open" class="hub__backdrop" @click="open = false" />

    <!-- `inert` rather than `aria-hidden`: the ring keeps focus after an action
         is picked, and hiding a focused element from assistive tech is invalid. -->
    <div class="hub__ring" :inert="!open || undefined">
      <button
        v-for="(action, index) in actions"
        :key="action.id"
        class="hub__action"
        type="button"
        :tabindex="open ? 0 : -1"
        :aria-label="action.label"
        :title="action.label"
        :style="{
          '--angle': `${angleFor(index)}deg`,
          '--delay': `${index * 22}ms`,
        }"
        @click="run(action.id)"
      >
        <AppIcon :name="action.icon" />
      </button>
    </div>

    <button
      class="hub__toggle"
      type="button"
      :aria-label="open ? 'Close menu' : 'Open menu'"
      :aria-expanded="open"
      @click="open = !open"
    >
      <AppIcon :name="open ? 'close' : 'menu'" />
    </button>
  </div>
</template>

<style scoped>
/*
  The hub spans the viewport instead of being a transformed point: a transform
  here would make the fixed backdrop resolve against the hub's own box, leaving
  it with no area to dim or catch taps. Pointer events pass through except on
  the controls themselves.
*/
.hub {
  position: fixed;
  inset: 0;
  z-index: 30;
  pointer-events: none;
}

.hub__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(4, 5, 9, 0.45);
  backdrop-filter: blur(2px);
  pointer-events: auto;
  animation: hub-fade var(--dur) var(--ease);
}

.hub__toggle,
.hub__action {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  pointer-events: auto;
  border: 1px solid var(--chrome-border);
  border-radius: 999px;
  background: var(--chrome-bg);
  box-shadow: var(--chrome-shadow);
  color: var(--chrome-fg);
}

.hub__toggle {
  width: 56px;
  height: 56px;
  margin: -28px 0 0 -28px;
  font-size: 1.4rem;
  transition:
    transform var(--dur) var(--ease),
    background var(--dur) var(--ease);
}

.hub[data-open='true'] .hub__toggle {
  background: var(--accent);
  color: var(--accent-contrast);
  transform: rotate(90deg);
}

.hub__toggle:active {
  transform: scale(0.94);
}

.hub__action {
  width: 50px;
  height: 50px;
  margin: -25px 0 0 -25px;
  font-size: 1.25rem;
  opacity: 0;
  pointer-events: none;
  transform: rotate(var(--angle)) translate(0) rotate(calc(var(--angle) * -1)) scale(0.4);
  transition:
    transform var(--dur) var(--ease) var(--delay),
    opacity var(--dur) var(--ease) var(--delay);
}

.hub[data-open='true'] .hub__action {
  opacity: 1;
  pointer-events: auto;
  transform: rotate(var(--angle)) translate(94px) rotate(calc(var(--angle) * -1)) scale(1);
}

.hub__action:active {
  background: var(--chrome-raised);
}

@keyframes hub-fade {
  from {
    opacity: 0;
  }
}
</style>
