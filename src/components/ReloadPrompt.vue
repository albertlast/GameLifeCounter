<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW()

const close = () => {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <div v-if="offlineReady || needRefresh" class="toast" role="status">
    <p class="toast__text">
      {{ offlineReady ? 'Ready to play offline.' : 'A new version is available.' }}
    </p>
    <div class="toast__actions">
      <button
        v-if="needRefresh"
        class="toast__button toast__button--primary"
        type="button"
        @click="updateServiceWorker()"
      >
        Reload
      </button>
      <button class="toast__button" type="button" @click="close">Dismiss</button>
    </div>
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  right: calc(12px + var(--safe-right));
  bottom: calc(12px + var(--safe-bottom));
  z-index: 50;
  display: grid;
  gap: 10px;
  max-width: min(320px, calc(100vw - 24px));
  padding: 14px 16px;
  border: 1px solid var(--chrome-border);
  border-radius: var(--radius-md);
  background: var(--chrome-bg);
  box-shadow: var(--chrome-shadow);
  color: var(--chrome-fg);
  font-size: 0.9rem;
}

.toast__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.toast__button {
  padding: 7px 14px;
  border: 1px solid var(--chrome-border);
  border-radius: 999px;
  font-weight: 600;
}

.toast__button--primary {
  border-color: transparent;
  background: var(--accent);
  color: var(--accent-contrast);
}
</style>
