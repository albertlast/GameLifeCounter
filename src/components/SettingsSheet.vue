<script setup lang="ts">
import { computed, ref } from 'vue'
import OverlaySheet from './OverlaySheet.vue'
import AppIcon from './AppIcon.vue'
import LayoutPreview from './LayoutPreview.vue'
import { useGameStore } from '../game/inject'
import { GAME_PRESETS } from '../game/presets'
import { layoutsForPlayers } from '../game/layouts'
import { MAX_PLAYERS, MIN_PLAYERS } from '../game/types'
import { THEMES } from '../theme/themes'
import { useFullscreen, useWakeLock } from '../composables/useScreen'

const emit = defineEmits<{ (e: 'close'): void }>()

const game = useGameStore()
const fullscreen = useFullscreen()
const wakeLock = useWakeLock()

/** Picking a player count opens the layout step, which previews on the table. */
const step = ref<'settings' | 'layout'>('settings')

const playerCounts = Array.from(
  { length: MAX_PLAYERS - MIN_PLAYERS + 1 },
  (_, index) => MIN_PLAYERS + index,
)

const lifeSteps = [-10, -1, 1, 10]

const startingLifeLabel = computed(() => game.state.startingLife.toLocaleString('en-US'))

/** Not every layout suits every player count, so the picker follows the count. */
const availableLayouts = computed(() => layoutsForPlayers(game.state.playerCount))

const choosePlayerCount = (count: number) => {
  game.setPlayerCount(count)
  step.value = 'layout'
}

const startNewGame = () => {
  game.resetGame()
  emit('close')
}
</script>

<template>
  <OverlaySheet
    v-if="step === 'layout'"
    title="Table layout"
    subtitle="Where is everybody sitting? The table behind updates as you pick."
    preview
    @close="step = 'settings'"
  >
    <div class="options">
      <button
        v-for="tableLayout in availableLayouts"
        :key="tableLayout.id"
        class="option"
        type="button"
        :aria-pressed="game.state.layoutId === tableLayout.id"
        @click="game.setLayout(tableLayout.id)"
      >
        <LayoutPreview :player-count="game.state.playerCount" :layout-id="tableLayout.id" />
        <span class="option__text">
          <span class="option__name">{{ tableLayout.name }}</span>
          <span class="option__hint">{{ tableLayout.description }}</span>
        </span>
        <AppIcon v-if="game.state.layoutId === tableLayout.id" name="check" class="option__check" />
      </button>
    </div>
    <button class="action action--spaced" type="button" @click="emit('close')">
      <AppIcon name="check" />
      Done
    </button>
  </OverlaySheet>

  <OverlaySheet v-else title="Settings" subtitle="Table, rules and looks" @close="emit('close')">
    <section class="section">
      <h3 class="section__title">Players</h3>
      <div class="segmented" role="group" aria-label="Number of players">
        <button
          v-for="count in playerCounts"
          :key="count"
          class="segmented__item"
          type="button"
          :aria-pressed="game.state.playerCount === count"
          @click="choosePlayerCount(count)"
        >
          {{ count }}
        </button>
      </div>
      <button class="layout-row" type="button" @click="step = 'layout'">
        <LayoutPreview :player-count="game.state.playerCount" :layout-id="game.state.layoutId" />
        <span class="option__text">
          <span class="option__name">{{ game.tableLayout.value.name }}</span>
          <span class="option__hint">{{ game.tableLayout.value.description }}</span>
        </span>
        <span class="layout-row__more" aria-hidden="true">›</span>
      </button>
    </section>

    <section class="section">
      <h3 class="section__title">Game preset</h3>
      <div class="options">
        <button
          v-for="preset in GAME_PRESETS"
          :key="preset.id"
          class="option"
          type="button"
          :aria-pressed="game.state.presetId === preset.id"
          @click="game.applyPreset(preset.id)"
        >
          <span class="option__text">
            <span class="option__name">{{ preset.name }}</span>
            <span class="option__hint">{{ preset.description }}</span>
          </span>
          <span class="option__meta">{{ preset.startingLife }}</span>
          <AppIcon v-if="game.state.presetId === preset.id" name="check" class="option__check" />
        </button>
      </div>
    </section>

    <section class="section">
      <h3 class="section__title">Starting life</h3>
      <div class="stepper">
        <button
          v-for="step in lifeSteps"
          :key="step"
          class="stepper__button"
          type="button"
          :aria-label="`${step > 0 ? 'Increase' : 'Decrease'} starting life by ${Math.abs(step)}`"
          @click="game.setStartingLife(game.state.startingLife + step)"
        >
          {{ step > 0 ? `+${step}` : step }}
        </button>
        <output class="stepper__value">{{ startingLifeLabel }}</output>
      </div>
      <button class="action" type="button" @click="startNewGame">
        <AppIcon name="refresh" />
        Start new game
      </button>
    </section>

    <section class="section">
      <h3 class="section__title">Theme</h3>
      <div class="themes">
        <button
          v-for="theme in THEMES"
          :key="theme.id"
          class="theme"
          type="button"
          :aria-pressed="game.state.themeId === theme.id"
          @click="game.setTheme(theme.id)"
        >
          <span
            class="theme__swatch"
            :style="{
              background: `linear-gradient(135deg, hsl(${theme.preview[0]} 92% 50%), hsl(${theme.preview[1]} 88% 45%))`,
            }"
          />
          <span class="option__text">
            <span class="option__name">{{ theme.name }}</span>
            <span class="option__hint">{{ theme.tagline }}</span>
          </span>
          <AppIcon v-if="game.state.themeId === theme.id" name="check" class="option__check" />
        </button>
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <h3 class="section__title">Player colours</h3>
        <button class="link touch-target" type="button" @click="game.resetColors()">Reset</button>
      </div>
      <div class="players">
        <div v-for="player in game.activePlayers.value" :key="player.id" class="player">
          <span class="player__dot" :style="{ background: `hsl(${player.hue} 92% 50%)` }" />
          <input
            :id="`player-name-${player.id}`"
            :name="`player-name-${player.id}`"
            class="player__name"
            type="text"
            maxlength="24"
            autocomplete="off"
            :value="player.name"
            :aria-label="`Name of player ${player.id + 1}`"
            @change="game.setName(player.id, ($event.target as HTMLInputElement).value)"
          />
          <input
            :id="`player-hue-${player.id}`"
            :name="`player-hue-${player.id}`"
            class="player__hue"
            type="range"
            min="0"
            max="359"
            :value="player.hue"
            :aria-label="`Colour of ${player.name}`"
            @input="game.setHue(player.id, Number(($event.target as HTMLInputElement).value))"
          />
        </div>
      </div>
    </section>

    <section class="section">
      <h3 class="section__title">Display</h3>
      <button
        v-if="fullscreen.supported.value"
        class="toggle"
        type="button"
        :aria-pressed="fullscreen.isFullscreen.value"
        @click="fullscreen.toggle()"
      >
        <AppIcon name="fullscreen" />
        <span class="option__text">
          <span class="option__name">Fullscreen</span>
          <span class="option__hint">Hide the browser interface</span>
        </span>
        <span class="switch" :data-on="fullscreen.isFullscreen.value" />
      </button>
      <button
        v-if="wakeLock.supported.value"
        class="toggle"
        type="button"
        :aria-pressed="wakeLock.active.value"
        @click="wakeLock.toggle()"
      >
        <AppIcon name="awake" />
        <span class="option__text">
          <span class="option__name">Keep screen awake</span>
          <span class="option__hint">Stops the display from sleeping mid-game</span>
        </span>
        <span class="switch" :data-on="wakeLock.active.value" />
      </button>
      <p v-if="wakeLock.error.value" class="error">{{ wakeLock.error.value }}</p>
    </section>
  </OverlaySheet>
</template>

<style scoped>
.section {
  padding: 14px 0;
  border-top: 1px solid var(--chrome-border);
}

.section:first-of-type {
  border-top: 0;
}

.section__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.section__title {
  margin-bottom: 10px;
  color: var(--chrome-muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.segmented {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.segmented__item {
  padding: 12px 0;
  border: 1px solid var(--chrome-border);
  border-radius: var(--radius-sm);
  background: var(--chrome-raised);
  font-size: 1.05rem;
  font-weight: 600;
  transition: background var(--dur-fast) var(--ease);
}

.segmented__item[aria-pressed='true'] {
  background: var(--accent);
  border-color: transparent;
  color: var(--accent-contrast);
}

.options,
.themes,
.players {
  display: grid;
  gap: 8px;
}

.option,
.theme,
.toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--chrome-border);
  border-radius: var(--radius-md);
  background: var(--chrome-raised);
  text-align: left;
}

.option[aria-pressed='true'],
.theme[aria-pressed='true'] {
  border-color: var(--accent);
}

.option__text {
  display: grid;
  flex: 1;
  min-width: 0;
  gap: 2px;
}

.option__name {
  font-weight: 600;
}

.option__hint {
  color: var(--chrome-muted);
  font-size: 0.8rem;
}

.option__meta {
  color: var(--chrome-muted);
  font-variant-numeric: tabular-nums;
}

.option__check {
  color: var(--accent);
}

.theme__swatch {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16);
}

.stepper {
  display: grid;
  grid-template-columns: repeat(2, 1fr) minmax(84px, 1.4fr) repeat(2, 1fr);
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.stepper__button {
  padding: 12px 0;
  border: 1px solid var(--chrome-border);
  border-radius: var(--radius-sm);
  background: var(--chrome-raised);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* Source order is -10, -1, +1, +10, value; `order` puts the readout in the
   middle so the buttons read as a natural range. */
.stepper__value {
  order: 1;
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.stepper__button:nth-child(3),
.stepper__button:nth-child(4) {
  order: 2;
}

.action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--accent-contrast);
  font-weight: 700;
}

.action--spaced {
  margin-top: 14px;
}

.layout-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
  padding: 10px 14px;
  border: 1px solid var(--chrome-border);
  border-radius: var(--radius-md);
  background: var(--chrome-raised);
  text-align: left;
}

.layout-row__more {
  color: var(--chrome-muted);
  font-size: 1.4rem;
  line-height: 1;
}

.player {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 10px 12px;
  padding: 10px 12px;
  border: 1px solid var(--chrome-border);
  border-radius: var(--radius-md);
  background: var(--chrome-raised);
}

.player__dot {
  width: 18px;
  height: 18px;
  border-radius: 999px;
}

.player__name {
  min-width: 0;
  padding: 11px 10px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.25);
  color: inherit;
  font: inherit;
}

.player__name:focus {
  border-color: var(--chrome-border);
  outline: none;
}

.player__hue {
  grid-column: 1 / -1;
  width: 100%;
  height: 30px;
  appearance: none;
  background: linear-gradient(
    to right,
    hsl(0 90% 50%),
    hsl(60 90% 50%),
    hsl(120 90% 50%),
    hsl(180 90% 50%),
    hsl(240 90% 50%),
    hsl(300 90% 50%),
    hsl(360 90% 50%)
  );
  border-radius: 999px;
}

.player__hue::-webkit-slider-thumb {
  appearance: none;
  width: 28px;
  height: 28px;
  border: 3px solid #fff;
  border-radius: 999px;
  background: transparent;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

.player__hue::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border: 3px solid #fff;
  border-radius: 999px;
  background: transparent;
}

.switch {
  position: relative;
  width: 44px;
  height: 26px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  transition: background var(--dur) var(--ease);
}

.switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #fff;
  transition: transform var(--dur) var(--ease);
}

.switch[data-on='true'] {
  background: var(--accent);
}

.switch[data-on='true']::after {
  transform: translateX(18px);
}

.link {
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
}

.error {
  margin-top: 8px;
  color: var(--danger);
  font-size: 0.8rem;
}
</style>
