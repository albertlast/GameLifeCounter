<script setup lang="ts">
import { computed, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useHoldRepeat } from '../composables/useHoldRepeat'
import { usePendingDelta } from '../composables/usePendingDelta'
import { COUNTER_ICONS, COUNTER_LABELS } from '../game/types'
import type { CounterKind, Player } from '../game/types'

const {
  player,
  counters = [],
  step = 1,
  bigStep = 10,
  isFirstPlayer = false,
} = defineProps<{
  player: Player
  counters?: CounterKind[]
  step?: number
  bigStep?: number
  isFirstPlayer?: boolean
}>()

const emit = defineEmits<{
  (e: 'life', delta: number): void
  (e: 'counter', kind: CounterKind, delta: number): void
}>()

const pending = usePendingDelta()

const changeLife = (delta: number) => {
  emit('life', delta)
  pending.add(delta)
}

const minus = useHoldRepeat({
  onTap: () => changeLife(-step),
  onHold: () => changeLife(-bigStep),
})

const plus = useHoldRepeat({
  onTap: () => changeLife(step),
  onHold: () => changeLife(bigStep),
})

// An external reset (new game) should not leave a stale "-7" floating around.
watch(
  () => player.life,
  (life, previous) => {
    if (Math.abs(life - previous) > Math.max(Math.abs(bigStep) * 4, 100)) pending.reset()
  },
)

const lifeLabel = computed(() => player.life.toString())
const digitCount = computed(() => Math.max(2, lifeLabel.value.replace('-', '').length))

const capture = (event: PointerEvent) => {
  const target = event.currentTarget as HTMLElement
  if (target.setPointerCapture && event.pointerId !== undefined) {
    try {
      target.setPointerCapture(event.pointerId)
    } catch {
      // Not fatal: without capture we still get pointerup on the element.
    }
  }
}
</script>

<template>
  <section
    class="panel"
    :style="{ '--player-hue': player.hue, '--digits': digitCount }"
    :data-first="isFirstPlayer ? 'true' : undefined"
    :aria-label="`${player.name}: ${player.life} life`"
  >
    <button
      class="zone zone--minus"
      type="button"
      :aria-label="`Remove ${step} life from ${player.name}`"
      @pointerdown.prevent="
        (event: PointerEvent) => {
          capture(event)
          minus.start(event.pointerId)
        }
      "
      @pointerup="(event: PointerEvent) => minus.stop(event.pointerId)"
      @pointercancel="(event: PointerEvent) => minus.cancel(event.pointerId)"
      @keydown.enter.prevent="changeLife(-step)"
      @keydown.space.prevent="changeLife(-step)"
    >
      <span class="zone__glyph" :class="{ 'zone__glyph--active': minus.isHolding.value }">
        <AppIcon name="minus" :stroke-width="2.2" />
      </span>
    </button>

    <div class="readout">
      <p class="name">
        <AppIcon v-if="isFirstPlayer" name="crown" class="name__crown" />
        {{ player.name }}
      </p>

      <p class="delta" :class="{ 'delta--visible': pending.visible.value }" aria-hidden="true">
        {{ pending.label.value }}
      </p>

      <p class="life" role="status">{{ lifeLabel }}</p>

      <div v-if="counters.length" class="chips">
        <div v-for="kind in counters" :key="kind" class="chip">
          <button
            class="chip__step touch-target"
            type="button"
            :aria-label="`Remove ${COUNTER_LABELS[kind]} from ${player.name}`"
            @click="emit('counter', kind, -1)"
          >
            <AppIcon name="minus" />
          </button>
          <span class="chip__value" :title="COUNTER_LABELS[kind]">
            <span class="chip__icon" aria-hidden="true">{{ COUNTER_ICONS[kind] }}</span>
            {{ player.counters[kind] }}
          </span>
          <button
            class="chip__step touch-target"
            type="button"
            :aria-label="`Add ${COUNTER_LABELS[kind]} to ${player.name}`"
            @click="emit('counter', kind, 1)"
          >
            <AppIcon name="plus" />
          </button>
        </div>
      </div>
    </div>

    <button
      class="zone zone--plus"
      type="button"
      :aria-label="`Add ${step} life to ${player.name}`"
      @pointerdown.prevent="
        (event: PointerEvent) => {
          capture(event)
          plus.start(event.pointerId)
        }
      "
      @pointerup="(event: PointerEvent) => plus.stop(event.pointerId)"
      @pointercancel="(event: PointerEvent) => plus.cancel(event.pointerId)"
      @keydown.enter.prevent="changeLife(step)"
      @keydown.space.prevent="changeLife(step)"
    >
      <span class="zone__glyph" :class="{ 'zone__glyph--active': plus.isHolding.value }">
        <AppIcon name="plus" :stroke-width="2.2" />
      </span>
    </button>
  </section>
</template>

<style scoped>
.panel {
  position: relative;
  display: grid;
  grid-template-columns: 1fr minmax(0, auto) 1fr;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: var(--panel-pad);
  border: var(--panel-border);
  border-radius: var(--panel-radius);
  background: var(--panel-bg);
  box-shadow: var(--panel-shadow);
  color: var(--panel-fg);
  font-family: var(--font-display);
  transition:
    background var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}

.panel[data-first='true'] {
  box-shadow:
    var(--panel-shadow),
    0 0 0 2px hsl(var(--player-hue) 95% 72% / 0.85);
}

/* Tap zones: the full column is pressable, the glyph is only the visual. */
.zone {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 2cqw;
  color: inherit;
}

.zone--minus {
  justify-content: flex-start;
}

.zone--plus {
  justify-content: flex-end;
}

.zone__glyph {
  display: grid;
  place-items: center;
  width: var(--zone-size);
  max-width: 100%;
  aspect-ratio: 1;
  border: var(--zone-border);
  border-radius: var(--zone-radius);
  background: var(--zone-bg);
  font-size: min(12cqh, 12cqw);
  opacity: var(--zone-opacity);
  transition:
    transform var(--dur-fast) var(--ease),
    opacity var(--dur-fast) var(--ease);
}

.zone:active .zone__glyph,
.zone__glyph--active {
  opacity: 1;
  transform: scale(0.92);
}

.readout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  gap: 0.15em;
}

.name {
  display: flex;
  align-items: center;
  gap: 0.4em;
  max-width: 60cqw;
  overflow: hidden;
  font-size: min(4.4cqh, 5cqw);
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: var(--name-opacity);
}

.name__crown {
  font-size: 1.4em;
}

.delta {
  font-size: min(6cqh, 7cqw);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  opacity: 0;
  transform: translateY(0.15em);
  transition:
    opacity var(--dur) var(--ease),
    transform var(--dur) var(--ease);
}

.delta--visible {
  opacity: 0.85;
  transform: translateY(0);
}

.life {
  font-size: min(44cqh, calc(72cqw / var(--digits, 2)));
  font-weight: var(--life-weight);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--life-letter-spacing);
  line-height: 0.95;
  text-shadow: var(--life-shadow);
}

/*
  Three seats across leaves each one narrow. Below ~170px the numerals would
  squeeze the -/+ columns under a comfortable touch target, so the readout
  gives width back to them. Must stay after the base rules: a container query
  adds no specificity of its own.
*/
@container (max-width: 170px) {
  .name {
    font-size: min(3.6cqh, 8cqw);
    letter-spacing: 0.08em;
  }

  .delta {
    font-size: min(5cqh, 10cqw);
  }

  .life {
    font-size: min(38cqh, calc(52cqw / var(--digits, 2)));
  }

  /* The counter chip, not the numerals, sets the readout width here. */
  .chip {
    gap: 0.2em;
    padding: 0.1em 0.25em;
  }

  .chip__value {
    min-width: 1.2em;
    gap: 0.15em;
  }

  .chip__step {
    padding: 0.1em;
  }
}

.chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5em;
  margin-top: 0.3em;
  font-size: min(4.2cqh, 5cqw);
}

.chip {
  display: flex;
  align-items: center;
  gap: 0.35em;
  padding: 0.15em 0.35em;
  border: 1px solid var(--chip-border, rgba(255, 255, 255, 0.25));
  border-radius: 999px;
  background: var(--chip-bg, rgba(0, 0, 0, 0.2));
  font-variant-numeric: tabular-nums;
}

.chip__value {
  display: flex;
  align-items: center;
  gap: 0.25em;
  min-width: 1.6em;
  justify-content: center;
  font-weight: 600;
}

.chip__icon {
  opacity: 0.75;
}

.chip__step {
  display: grid;
  place-items: center;
  padding: 0.2em;
  border-radius: 999px;
  opacity: 0.8;
}

.chip__step:active {
  transform: scale(0.9);
}
</style>
