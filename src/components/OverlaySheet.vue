<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import AppIcon from './AppIcon.vue'

defineProps<{
  title: string
  subtitle?: string
  /** Keeps the table readable behind the sheet, for live previews. */
  preview?: boolean
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div
    class="overlay"
    :data-preview="preview ? 'true' : undefined"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
  >
    <div class="overlay__backdrop" @click="emit('close')" />
    <div class="sheet">
      <header class="sheet__head">
        <div>
          <h2 class="sheet__title">{{ title }}</h2>
          <p v-if="subtitle" class="sheet__subtitle">{{ subtitle }}</p>
        </div>
        <button
          class="sheet__close touch-target"
          type="button"
          aria-label="Close"
          @click="emit('close')"
        >
          <AppIcon name="close" />
        </button>
      </header>
      <div class="sheet__body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  /* A content-sized row would let the sheet grow past the viewport and make
     `max-height: 100%` on it meaningless, so pin the row to the overlay. */
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  place-items: center;
  padding: calc(12px + var(--safe-top)) calc(12px + var(--safe-right))
    calc(12px + var(--safe-bottom)) calc(12px + var(--safe-left));
}

.overlay__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(4, 5, 9, 0.72);
  backdrop-filter: blur(10px);
  animation: fade var(--dur) var(--ease);
}

/* Preview mode: barely tint the table and sit at the bottom, so changes made
   in the sheet can be seen on the table behind it. */
.overlay[data-preview='true'] {
  place-items: end center;
}

.overlay[data-preview='true'] .overlay__backdrop {
  background: rgba(4, 5, 9, 0.25);
  backdrop-filter: none;
}

.overlay[data-preview='true'] .sheet {
  animation: rise-up var(--dur) var(--ease);
}

.sheet {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(560px, 100%);
  max-height: 100%;
  border: 1px solid var(--chrome-border);
  border-radius: var(--radius-lg);
  background: var(--chrome-bg);
  box-shadow: var(--chrome-shadow);
  color: var(--chrome-fg);
  animation: rise var(--dur) var(--ease);
}

.sheet__head {
  flex: none;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 20px 12px;
}

.sheet__title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.sheet__subtitle {
  margin-top: 2px;
  color: var(--chrome-muted);
  font-size: 0.85rem;
}

.sheet__close {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--chrome-border);
  border-radius: 999px;
  background: var(--chrome-raised);
  font-size: 1.1rem;
}

.sheet__body {
  /* `min-height: 0` lets this flex child shrink so it, not the sheet, scrolls. */
  min-height: 0;
  overflow-y: auto;
  padding: 4px 20px 20px;
  overscroll-behavior: contain;
}

@keyframes fade {
  from {
    opacity: 0;
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
}

@keyframes rise-up {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
}
</style>
