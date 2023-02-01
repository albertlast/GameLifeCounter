<script setup lang="ts">
import { ref, watch } from 'vue'
import PlayerView from './components/PlayerView.vue'
import SettingView from './components/SettingView.vue'
import ReSettings5Line from './components/icons/ReSettings5Line.vue'

const showSettings = ref<boolean>(false)

const p1Ref = ref<typeof PlayerView | null>(null)
const p2Ref = ref<typeof PlayerView | null>(null)

const resetPlayers = () => {
  console.log('asd')
  p1Ref.value.resetLive()
  p2Ref.value.resetLive()
  showSettings.value = false
}
</script>

<template>
  <main class="w-screen h-screen">
    <div
      id="openSettings"
      class="openSetting"
      @click.stop="showSettings = !showSettings"
    >
      <ReSettings5Line />
    </div>
    <SettingView
      v-show="showSettings"
      @update:close="(value) => (showSettings = !value)"
      @update:reset="() => resetPlayers()"
    />
    <PlayerView
      class="PlayerView rotate-180 bg-cyan-900"
      style="height: 50dvh"
      player-name="first"
      ref="p1Ref"
    />
    <PlayerView
      class="PlayerView bg-yellow-600"
      style="height: 50dvh"
      player-name="second"
      ref="p2Ref"
    />
  </main>
</template>

<style>
.PlayerView {
  font-size: min(28vh, 30vw);
}
</style>
<style scoped>
.openSetting {
  position: absolute;
  top: 50dvh;
  right: 50dvw;
  transform: translate(50%, -50%);
  z-index: 5;
  font-size: min(14vh, 14vw);
}
</style>
