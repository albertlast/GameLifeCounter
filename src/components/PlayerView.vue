<script setup lang="ts">
import { ref, computed } from 'vue'

const delayFirstHold = 1000
const delayNextHold = 500

const { playerName } = defineProps<{ playerName: string }>()
const storagePath = `glc${playerName}.life`

const startLife = ref<number>(
  Number.parseInt(localStorage.getItem(storagePath) ?? '20')
)
const CurrentLife = ref(startLife.value)

const CurrentLifeCom = computed(() =>
  CurrentLife.value.toString().padStart(2, '0')
)

const partValueShow = ref<boolean>(false)
let partValueTimeOutID: number | null = null
const partValueVal = ref<number>(0)

const updatePartValue = async (val: number) => {
  CurrentLife.value += val
  localStorage.setItem(storagePath, CurrentLife.value.toString())
  if (partValueShow.value === false) {
    partValueVal.value = 0
    partValueShow.value = true
  }
  partValueVal.value += val
  if (partValueTimeOutID) clearTimeout(partValueTimeOutID)
  partValueTimeOutID = setTimeout(() => {
    partValueShow.value = false
  }, 2000)
}

const partValueCom = computed(() => {
  return new Intl.NumberFormat('en-US', {
    signDisplay: 'exceptZero',
  }).format(partValueVal.value)
})

let holdingReduceLifeHoldDown = false
let holdingAddLifeHoldDown = false
let holdingHoldDownID: number | null = null
let holdingHoldDownOnce = false

const addLifeHoldUp = () => {
  holdingAddLifeHoldDown = false
  clearTimeout(holdingHoldDownID)
  if (holdingHoldDownOnce === false) {
    updatePartValue(1)
  }
  holdingHoldDownOnce = false
}

const addLifeHoldDown = () => {
  holdingAddLifeHoldDown = true

  holdingHoldDownID = setTimeout(() => {
    again(10)
  }, delayFirstHold)
}

const reduceLifeHoldDown = () => {
  holdingReduceLifeHoldDown = true

  holdingHoldDownID = setTimeout(() => {
    again(-10)
  }, delayFirstHold)
}

const reduceLifeHoldUp = () => {
  holdingReduceLifeHoldDown = false
  clearTimeout(holdingHoldDownID)
  if (holdingHoldDownOnce === false) {
    updatePartValue(-1)
  }
  holdingHoldDownOnce = false
}

const again = (value: number) => {
  holdingHoldDownOnce = true
  if (value < 0 && !holdingReduceLifeHoldDown) {
    clearTimeout(holdingHoldDownID)
    return
  }
  if (value > 0 && !holdingAddLifeHoldDown) {
    clearTimeout(holdingHoldDownID)
    return
  }
  holdingHoldDownID = setTimeout(() => {
    again(value)
  }, delayNextHold)
  updatePartValue(value)
}

const resetLife = () => {
  CurrentLife.value = 20
}

defineExpose({ resetLife })
</script>

<template>
  <div class="grid grid-template w-full">
    <div
      @pointerdown="reduceLifeHoldDown"
      @pointerup="reduceLifeHoldUp"
      class="flex items-center"
    >
      -
    </div>
    <div class="grid">
      <div class="small" :class="{ invisible: !partValueShow }">
        {{ partValueCom }}
      </div>
      <div>{{ CurrentLifeCom }}</div>
    </div>
    <div
      @pointerdown="addLifeHoldDown"
      @pointerup="addLifeHoldUp"
      class="flex items-center justify-end"
    >
      +
    </div>
  </div>
</template>
<style scoped>
.small {
  font-size: min(5vh, 10vw);
}
.invisible {
  opacity: 0;
}

.grid-template {
  grid-template-columns: 1fr auto 1fr;
}
</style>
