<script setup lang="ts">
import { ref, computed } from 'vue'

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

const reduceLife = () => {
  updatePartValue(-1)
}
const addLife = () => {
  updatePartValue(1)
}

const resetLife = () => {
  CurrentLife.value = 20
}

defineExpose({ resetLife })
</script>

<template>
  <div class="grid grid-template w-full">
    <div @click.stop="reduceLife" class="flex items-center">-</div>
    <div class="grid">
      <div class="small" :class="{ invisible: !partValueShow }">
        {{ partValueCom }}
      </div>
      <div>{{ CurrentLifeCom }}</div>
    </div>
    <div @click.stop="addLife" class="flex items-center justify-end">+</div>
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
