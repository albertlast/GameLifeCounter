<script setup lang="ts">
import { computed } from 'vue'

export interface IconShape {
  /** Stroked paths. */
  paths?: string[]
  /** Filled paths. */
  fills?: string[]
  /** [cx, cy, r] circles; a 4th truthy entry fills them. */
  circles?: [number, number, number, boolean?][]
}

const ICONS = {
  menu: {
    circles: [
      [5, 12, 1.7, true],
      [12, 12, 1.7, true],
      [19, 12, 1.7, true],
    ],
  },
  settings: {
    paths: ['M4 7h9', 'M19 7h1', 'M4 17h3', 'M13 17h7'],
    circles: [
      [16, 7, 2.4],
      [10, 17, 2.4],
    ],
  },
  close: { paths: ['M6 6l12 12', 'M18 6L6 18'] },
  plus: { paths: ['M12 5v14', 'M5 12h14'] },
  minus: { paths: ['M5 12h14'] },
  check: { paths: ['M5 12.5l4.5 4.5L19 7.5'] },
  refresh: { paths: ['M20 12a8 8 0 1 1-2.4-5.7', 'M20.5 4v3.6H17'] },
  palette: {
    paths: [
      'M12 3.2a8.8 8.8 0 0 0 0 17.6c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h1.6a4 4 0 0 0 4-4c0-3.9-3.9-7-8.6-7z',
    ],
    circles: [
      [7.6, 12.2, 1.2, true],
      [9.7, 7.9, 1.2, true],
      [14.4, 7.6, 1.2, true],
    ],
  },
  players: {
    paths: [
      'M3 20.5c0-3.4 2.8-5.3 6-5.3s6 1.9 6 5.3',
      'M16.2 5.6a3.3 3.3 0 0 1 0 6.4',
      'M18 15.6c2.1.6 3 2.3 3 4.9',
    ],
    circles: [[9, 8.4, 3.3]],
  },
  dice: {
    paths: [
      'M7 3.8h10A3.2 3.2 0 0 1 20.2 7v10a3.2 3.2 0 0 1-3.2 3.2H7A3.2 3.2 0 0 1 3.8 17V7A3.2 3.2 0 0 1 7 3.8z',
    ],
    circles: [
      [8.4, 8.4, 1.3, true],
      [15.6, 15.6, 1.3, true],
      [12, 12, 1.3, true],
    ],
  },
  timer: {
    paths: ['M12 9.5V13l2.4 1.6', 'M9.2 2.4h5.6', 'M19 6.2l1.4-1.4'],
    circles: [[12, 13.2, 7.8]],
  },
  shuffle: {
    paths: [
      'M3.5 7h3.2l10 10h3.3',
      'M3.5 17h3.2l2.6-2.6',
      'M14.7 9.6L17 7h3',
      'M17.6 4.2l2.8 2.8-2.8 2.8',
      'M17.6 14.2l2.8 2.8-2.8 2.8',
    ],
  },
  crown: { paths: ['M4 19h16', 'M4 15.4L2.9 6.8l5.7 3.7L12 4.4l3.4 6.1 5.7-3.7L20 15.4z'] },
  fullscreen: {
    paths: [
      'M4 9V5.6A1.6 1.6 0 0 1 5.6 4H9',
      'M15 4h3.4A1.6 1.6 0 0 1 20 5.6V9',
      'M20 15v3.4a1.6 1.6 0 0 1-1.6 1.6H15',
      'M9 20H5.6A1.6 1.6 0 0 1 4 18.4V15',
    ],
  },
  awake: {
    paths: [
      'M12 2.5v2.2',
      'M12 19.3v2.2',
      'M2.5 12h2.2',
      'M19.3 12h2.2',
      'M5.2 5.2l1.6 1.6',
      'M17.2 17.2l1.6 1.6',
      'M18.8 5.2l-1.6 1.6',
      'M6.8 17.2l-1.6 1.6',
    ],
    circles: [[12, 12, 4]],
  },
  theme: {
    paths: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z'],
    fills: ['M12 3a9 9 0 0 0 0 18z'],
  },
  poison: {
    paths: ['M9.4 17.5h5.2', 'M8.8 20h6.4'],
    circles: [
      [12, 9.6, 6.4],
      [9.8, 9.4, 1.3, true],
      [14.2, 9.4, 1.3, true],
    ],
  },
  energy: { fills: ['M13.6 2.5L5.2 13.6h5.1l-1 7.9 8.5-11.2h-5.2z'] },
} as const satisfies Record<string, IconShape>

export type IconName = keyof typeof ICONS

const { name, strokeWidth = 1.8 } = defineProps<{
  name: IconName
  strokeWidth?: number
}>()

const shape = computed<IconShape>(() => ICONS[name])
</script>

<template>
  <svg
    class="app-icon"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="(d, index) in shape.paths ?? []" :key="`p${index}`" :d="d" />
    <path
      v-for="(d, index) in shape.fills ?? []"
      :key="`f${index}`"
      :d="d"
      fill="currentColor"
      stroke="none"
    />
    <circle
      v-for="(circle, index) in shape.circles ?? []"
      :key="`c${index}`"
      :cx="circle[0]"
      :cy="circle[1]"
      :r="circle[2]"
      :fill="circle[3] ? 'currentColor' : 'none'"
      :stroke="circle[3] ? 'none' : 'currentColor'"
    />
  </svg>
</template>

<style scoped>
.app-icon {
  display: block;
  flex: none;
}
</style>
