import RePaletteLineVue from './icons/RePaletteLine.vue';

<script setup lang="ts">
import RePaletteLine from './icons/RePaletteLine.vue'
import ColorPicker from '@radial-color-picker/vue-color-picker'
import TiRefreshVue from './icons/TiRefresh.vue'

const storagePathP1 = `glcP1Hue.Color`
const storagePathP2 = `glcP2Hue.Color`

const emit = defineEmits<{
  (e: 'update:close', value: void): void
  (e: 'update:p1Hue', value: number): void
  (e: 'update:p2Hue', value: number): void
}>()

defineProps<{
  p1Hue: Number
  p2Hue: Number
}>()

let updateColor1 = (hue) => {
  emit('update:p1Hue', hue)
  localStorage.setItem(storagePathP1, hue)
}
let updateColor2 = (hue) => {
  emit('update:p2Hue', hue)
  localStorage.setItem(storagePathP2, hue)
}

let resetColor = () => {
  updateColor1(32)
  updateColor2(222)
}
</script>
<template>
  <div class="setting">
    <div class="openSetting grid grid-cols-2">
      <RePaletteLine @click.stop="$emit('update:close')" />
      <TiRefreshVue @click.stop="resetColor" />
    </div>

    <div
      class="PlayerView p1Background flex justify-center items-center"
      style="height: 50dvh"
    >
      <color-picker class="colorPicker" :hue="p1Hue" @input="updateColor1" />
    </div>
    <div
      class="PlayerView p2Background flex justify-center items-center"
      style="height: 50dvh"
    >
      <color-picker class="colorPicker" :hue="p2Hue" @input="updateColor2" />
    </div>
  </div>
</template>
<style scoped>
.colorPicker {
  height: 1.3em;
  width: 1.3em;
}
.setting {
  position: absolute;
  inset: 0;
  z-index: 10;
  font-size: min(14vh, 14vw);
}
.openSetting {
  position: absolute;
  top: 50dvh;
  right: 50dvw;
  transform: translate(50%, -50%);
  z-index: 11;
  font-size: min(14vh, 14vw);
}
</style>
<style>
@import '@radial-color-picker/vue-color-picker/dist/vue-color-picker.min.css';
</style>
