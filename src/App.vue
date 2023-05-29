<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import PlayerView from './components/PlayerView.vue'
import SettingView from './components/SettingView.vue'
import ReSettings5Line from './components/icons/ReSettings5Line.vue'
import ThMoreAltVue from './components/icons/ThMoreAlt.vue'
import TiRefreshVue from './components/icons/TiRefresh.vue'
import RePaletteLine from './components/icons/RePaletteLine.vue'
import ColorView from './components/ColorView.vue'

const showSettings = ref<boolean>(false)
const showElements = ref<boolean>(false)
const showColorSel = ref<boolean>(false)

const storagePathP1 = `glcP1Hue.Color`
const storagePathP2 = `glcP2Hue.Color`
const p1Ref = ref<typeof PlayerView | null>(null)
const p2Ref = ref<typeof PlayerView | null>(null)
const p1Hue = ref<number>(32)
const p2Hue = ref<number>(222)

const resetPlayers = () => {
  p1Ref.value?.resetLife()
  p2Ref.value?.resetLife()
  showSettings.value = false
}

onMounted(() => {
  p1Hue.value = Number.parseFloat(localStorage.getItem(storagePathP1) ?? '32')
  p2Hue.value = Number.parseFloat(localStorage.getItem(storagePathP2) ?? '222')
})
</script>

<template>
  <main class="w-screen h-screen">
    <div
      id="openSettings"
      class="openSetting"
      v-if="!showElements"
      @click.stop="showElements = !showElements"
    >
      <ThMoreAltVue />
    </div>
    <div v-if="showElements" class="openSetting grid grid-cols-3">
      <ReSettings5Line
        @click.stop="
          () => {
            showSettings = !showSettings
            showElements = false
          }
        "
      />
      <RePaletteLine
        @click.stop="
          () => {
            showColorSel = !showColorSel
            showElements = false
          }
        "
      />
      <TiRefreshVue
        @click.stop="
          () => {
            resetPlayers()
            showElements = false
          }
        "
      />
    </div>
    <SettingView
      v-show="showSettings"
      @update:close="(value) => (showSettings = !value)"
    />
    <ColorView
      v-if="showColorSel"
      @update:close="() => (showColorSel = false)"
      v-model:p1-hue="p1Hue"
      v-model:p2-hue="p2Hue"
    />
    <PlayerView
      class="PlayerView rotate-180 p1Background"
      style="height: 50dvh"
      player-name="first"
      ref="p1Ref"
    />
    <PlayerView
      class="PlayerView p2Background"
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
.p1Background {
  background-color: hsl(v-bind(p1Hue), 95%, 44%);
}
.p2Background {
  background-color: hsl(v-bind(p2Hue), 95%, 44%);
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
