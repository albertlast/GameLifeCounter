import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import GameStage from '../GameStage.vue'
import PlayerPanel from '../PlayerPanel.vue'
import { createGameStore } from '../../game/store'
import { GAME_STORE_KEY } from '../../game/inject'

const mountStage = (store = createGameStore(), props: Record<string, unknown> = {}) => ({
  store,
  wrapper: mount(GameStage, {
    props,
    global: { provide: { [GAME_STORE_KEY as symbol]: store } },
  }),
})

describe('GameStage', () => {
  it('seats every active player and rotates them towards their edge', async () => {
    const { store, wrapper } = mountStage()

    expect(wrapper.findAllComponents(PlayerPanel)).toHaveLength(2)
    expect(wrapper.findAll('.seat').map((seat) => seat.attributes('data-rotation'))).toEqual([
      '180',
      '0',
    ])

    store.setPlayerCount(6)
    await nextTick()

    expect(wrapper.findAllComponents(PlayerPanel)).toHaveLength(6)
    expect(wrapper.findAll('.seat').map((seat) => seat.attributes('data-rotation'))).toEqual([
      '180',
      '180',
      '180',
      '0',
      '0',
      '0',
    ])
  })

  it('lays the grid out from the seat layout', () => {
    const store = createGameStore({ playerCount: 3 })
    const { wrapper } = mountStage(store)
    const style = wrapper.find('.stage').attributes('style') ?? ''

    expect(style).toContain('grid-template-columns: repeat(2, 1fr)')
    expect(style).toContain('grid-template-rows: repeat(2, 1fr)')
  })

  it('routes life changes to the right player', async () => {
    const { store, wrapper } = mountStage()

    await wrapper.findAllComponents(PlayerPanel)[1].vm.$emit('life', -3)

    expect(store.playerAt(0)?.life).toBe(20)
    expect(store.playerAt(1)?.life).toBe(17)
  })

  it('routes counter changes to the right player', async () => {
    const { store, wrapper } = mountStage()

    await wrapper.findAllComponents(PlayerPanel)[0].vm.$emit('counter', 'poison', 2)

    expect(store.playerAt(0)?.counters.poison).toBe(2)
  })

  it('hands the preset steps and counters to each panel', () => {
    const store = createGameStore()
    store.applyPreset('duel8000')
    const { wrapper } = mountStage(store)

    expect(wrapper.findComponent(PlayerPanel).props()).toMatchObject({
      step: 50,
      bigStep: 500,
      counters: [],
    })
  })

  it('flags the randomly picked starting player', () => {
    const { wrapper } = mountStage(createGameStore(), { firstPlayerId: 1 })
    const panels = wrapper.findAllComponents(PlayerPanel)

    expect(panels[0].props('isFirstPlayer')).toBe(false)
    expect(panels[1].props('isFirstPlayer')).toBe(true)
  })
})
