<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import GameStage from './components/GameStage.vue'
import ControlHub from './components/ControlHub.vue'
import type { HubAction } from './components/ControlHub.vue'
import SettingsSheet from './components/SettingsSheet.vue'
import DiceSheet from './components/DiceSheet.vue'
import MatchTimerBar from './components/MatchTimerBar.vue'
import StarterOverlay from './components/StarterOverlay.vue'
import ReloadPrompt from './components/ReloadPrompt.vue'
import { useGame } from './game/store'
import { GAME_STORE_KEY } from './game/inject'
import { useTheme } from './theme/useTheme'

const game = useGame()
provide(GAME_STORE_KEY, game)
useTheme(game)

const showSettings = ref(false)
const showDice = ref(false)
const showTimer = ref(false)
const showStarter = ref(false)
const firstPlayerId = ref<number | null>(null)

const firstPlayer = computed(
  () => game.activePlayers.value.find((player) => player.id === firstPlayerId.value) ?? null,
)

const pickFirstPlayer = () => {
  firstPlayerId.value = game.randomFirstPlayer()
  showStarter.value = true
}

const newGame = () => {
  game.resetGame()
  firstPlayerId.value = null
}

const onHubAction = (action: HubAction) => {
  switch (action) {
    case 'settings':
      showSettings.value = true
      break
    case 'dice':
      showDice.value = true
      break
    case 'timer':
      showTimer.value = !showTimer.value
      break
    case 'starter':
      pickFirstPlayer()
      break
    case 'reset':
      newGame()
      break
  }
}
</script>

<template>
  <main class="app">
    <GameStage :first-player-id="firstPlayerId" />

    <MatchTimerBar v-show="showTimer" @close="showTimer = false" />
    <ControlHub @action="onHubAction" />

    <SettingsSheet v-if="showSettings" @close="showSettings = false" />
    <DiceSheet v-if="showDice" @close="showDice = false" />
    <StarterOverlay
      v-if="showStarter && firstPlayer"
      :player="firstPlayer"
      @close="showStarter = false"
    />

    <ReloadPrompt />
  </main>
</template>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
