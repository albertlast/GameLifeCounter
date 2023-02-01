<script setup lang="ts">
import { ref, computed } from 'vue'

const { playerName } = defineProps<{ playerName: string }>()
const storagePath = `glc${playerName}.live`

const startLive = ref<number>(
  Number.parseInt(localStorage.getItem(storagePath) ?? '20')
)
const CurrentLive = ref(startLive.value)

const partValueShow = ref<boolean>(false)
let partValueTimeOutID: number | null = null
const partValueVal = ref<number>(0)

const updatePartValue = async (val: number) => {
  CurrentLive.value += val
  localStorage.setItem(storagePath, CurrentLive.value.toString())
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

const reduceLive = () => {
  updatePartValue(-1)
}
const addLive = () => {
  updatePartValue(1)
}
</script>

<template>
  <div class="grid grid-template w-full">
    <div @click.stop="reduceLive" class="flex items-center">-</div>
    <div class="grid">
      <div class="small" :class="{ invisible: !partValueShow }">
        {{ partValueCom }}
      </div>
      <div>{{ CurrentLive }}</div>
    </div>
    <div @click.stop="addLive" class="flex items-center justify-end">+</div>
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
