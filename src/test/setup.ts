import { beforeEach } from 'vitest'
import { resetGameStore } from '../game/store'

beforeEach(() => {
  localStorage.clear()
  resetGameStore()
  document.documentElement.removeAttribute('data-theme')
})
