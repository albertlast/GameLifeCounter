<script setup lang="ts">
import { ref, watch } from 'vue'
import ReCheckboxBlankLine from './icons/ReCheckboxBlankLine.vue'
import ReCheckboxLine from './icons/ReCheckboxLine.vue'

const FullscreenEnabled = ref<boolean>(false)
const ScreenOffEnabled = ref<boolean>(false)
let wakeLock: null | AbortController = null
const errorSceenOff = ref<string | null>(null)
const ScreenOffExists = ref<boolean>(typeof navigator.wakeLock === 'object')

defineEmits<{
  (e: 'update:close', value: boolean): void
}>()

watch(FullscreenEnabled, async (newFullscreenEnabled) => {
  if (newFullscreenEnabled) document.documentElement.requestFullscreen()
  else document.exitFullscreen()
})

const requestWakeLock = async () => {
  try {
    wakeLock = await navigator.wakeLock.request('screen')
    wakeLock.addEventListener('release', (e) => {
      console.log(e)
      console.log('Wake Lock was released')
      // errorSceenOff.value = 'Wake Lock was released'

      ScreenOffEnabled.value = false
    })
    // errorSceenOff.value = 'Wake Lock is active'
    console.log('Wake Lock is active')
  } catch (e) {
    // errorSceenOff.value = `${e.name}, ${e.message}`
    console.error(`${e.name}, ${e.message}`)
  }
}

watch(ScreenOffEnabled, (newScreenOffEnabled) => {
  if (newScreenOffEnabled) {
    requestWakeLock()
  } else if (wakeLock) {
    wakeLock.release()
    wakeLock = null
  }
})
</script>

<template>
  <div
    id="setting"
    class="setting bg-red-800 flex align-middle flex-col items-center"
  >
    <div>Fullscreen</div>
    <div @click.stop="FullscreenEnabled = !FullscreenEnabled">
      <ReCheckboxBlankLine v-if="!FullscreenEnabled" />
      <ReCheckboxLine v-if="FullscreenEnabled" />
    </div>
    <div v-if="ScreenOffExists">Screen-Off</div>
    <div
      @click.stop="ScreenOffEnabled = !ScreenOffEnabled"
      v-if="ScreenOffExists"
    >
      <ReCheckboxBlankLine v-if="!ScreenOffEnabled" />
      <ReCheckboxLine v-if="ScreenOffEnabled" />
    </div>

    <!-- <input type="checkbox" v-model="ScreenOffEnabled" class="w-12 h-12" /> -->
    <div v-if="errorSceenOff">{{ errorSceenOff }}</div>
    <div class="grid gridCancelReset">
      <div @click.stop="$emit('update:close', true)">Close</div>
    </div>
  </div>
</template>

<style scoped>
.gridCancelReset {
  grid-template-columns: 1fr auto;
}
.setting {
  position: absolute;
  inset: 0;
  z-index: 10;
  font-size: min(14vh, 14vw);
}
</style>
