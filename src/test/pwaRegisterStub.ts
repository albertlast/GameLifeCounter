import { ref } from 'vue'

/** Stand-in for `virtual:pwa-register/vue`, which only exists in a Vite build. */
export function useRegisterSW() {
  return {
    offlineReady: ref(false),
    needRefresh: ref(false),
    updateServiceWorker: async () => {},
  }
}
