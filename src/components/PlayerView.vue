<script setup lang="ts">
import { ref } from 'vue'

const startLive = ref<number>(20)
const CurrentLive = ref(startLive.value)

const redurceLive = () => {
  CurrentLive.value--
}
const addLive = () => {
  CurrentLive.value++
}
</script>

<template>
  <div class="grid grid-cols-3 w-full">
    <div @click.stop="redurceLive" class="flex items-center"><p>-</p></div>
    <div class="flex items-center">{{ CurrentLive }}</div>
    <div @click.stop="addLive" class="flex items-center justify-end">+</div>
  </div>
</template>
