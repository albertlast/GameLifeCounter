<script setup lang="ts">
import PlayerView from './components/PlayerView.vue'
</script>

<template>
  <main class="w-screen h-screen">
    <PlayerView class="rotate-180 bg-cyan-900" style="height: 50vh" />
    <PlayerView class="bg-yellow-600" style="height: 50vh" />
  </main>
</template>

<style>
main {
  font-size: min(30vh, 30vw);
}
</style>
