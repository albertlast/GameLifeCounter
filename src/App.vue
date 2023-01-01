<script setup lang="ts">
import { ref, watch } from 'vue'
import PlayerView from './components/PlayerView.vue'
const FullscreenEnabled = ref<boolean>(false)
const ScreenOffEnabled = ref<boolean>(false)
let wakeLock: null | AbortController = null

const showSettings = ref<boolean>(false)
const errorSceenOff = ref<string | null>(null)

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
    errorSceenOff.value = `${e.name}, ${e.message}`
    console.error(`${e.name}, ${e.message}`)
  }
}

watch(ScreenOffEnabled, (newScreenOffEnabled) => {
  if (newScreenOffEnabled) {
    wakeLock = requestWakeLock()
  } else if (wakeLock) {
    wakeLock.release()
    wakeLock = null
  }
})
</script>

<template>
  <main class="w-screen h-screen">
    <div
      id="openSettings"
      class="openSetting"
      @click.stop="showSettings = !showSettings"
    >
      #
    </div>
    <div id="setting" class="setting bg-red-800" v-if="showSettings">
      <div>Fullscreen</div>
      <input type="checkbox" v-model="FullscreenEnabled" />
      <div>Screen-Off</div>
      <input type="checkbox" v-model="ScreenOffEnabled" />
      <div v-if="errorSceenOff">{{ errorSceenOff }}</div>
      <div @click.stop="showSettings = !showSettings">close</div>
    </div>
    <PlayerView
      class="PlayerView rotate-180 bg-cyan-900"
      style="height: 50vh"
    />
    <PlayerView class="PlayerView bg-yellow-600" style="height: 50vh" />
  </main>
</template>

<style>
.PlayerView {
  font-size: min(28vh, 30vw);
}
</style>
<style scoped>
.setting {
  position: absolute;
  inset: 0;
  z-index: 10;
  font-size: min(14vh, 14vw);
}
.openSetting {
  position: absolute;
  top: 50%;
  right: 50%;
  transform: translate(50%, -50%);
  z-index: 5;
  font-size: min(14vh, 14vw);
}
</style>
