<script setup lang="ts">
import { ref, watch } from 'vue'
import PlayerView from './components/PlayerView.vue'
import SettingView from './components/SettingView.vue'

const showSettings = ref<boolean>(false)
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
    <SettingView
      v-show="showSettings"
      @update:close="(value) => (showSettings = !value)"
    />
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
.openSetting {
  position: absolute;
  top: 50%;
  right: 50%;
  transform: translate(50%, -50%);
  z-index: 5;
  font-size: min(14vh, 14vw);
}
</style>
