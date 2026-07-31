import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../../App.vue'
import PlayerPanel from '../PlayerPanel.vue'
import SettingsSheet from '../SettingsSheet.vue'
import DiceSheet from '../DiceSheet.vue'
import StarterOverlay from '../StarterOverlay.vue'
import { useGame } from '../../game/store'

const openHub = async (wrapper: ReturnType<typeof mount>) => {
  await wrapper.find('.hub__toggle').trigger('click')
}

describe('App', () => {
  it('shows the table and applies the stored theme', () => {
    const wrapper = mount(App)

    expect(wrapper.findAllComponents(PlayerPanel)).toHaveLength(2)
    expect(document.documentElement.dataset.theme).toBe('pulse')
  })

  it('opens the settings sheet from the hub', async () => {
    const wrapper = mount(App)

    await openHub(wrapper)
    await wrapper.find('[aria-label="Settings"]').trigger('click')

    expect(wrapper.findComponent(SettingsSheet).exists()).toBe(true)

    await wrapper.findComponent(SettingsSheet).vm.$emit('close')
    expect(wrapper.findComponent(SettingsSheet).exists()).toBe(false)
  })

  it('opens the dice sheet from the hub', async () => {
    const wrapper = mount(App)

    await openHub(wrapper)
    await wrapper.find('[aria-label="Roll dice"]').trigger('click')

    expect(wrapper.findComponent(DiceSheet).exists()).toBe(true)
  })

  it('toggles the match timer without losing its state', async () => {
    // Attached to the document so visibility of the v-show'd bar is real.
    const wrapper = mount(App, { attachTo: document.body })
    const timer = () => wrapper.find('[role="timer"]')

    expect(timer().isVisible()).toBe(false)

    await openHub(wrapper)
    await wrapper.find('[aria-label="Match timer"]').trigger('click')
    expect(timer().isVisible()).toBe(true)

    await openHub(wrapper)
    await wrapper.find('[aria-label="Match timer"]').trigger('click')
    expect(timer().isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('starts a new game from the hub', async () => {
    const wrapper = mount(App)
    const game = useGame()
    game.adjustLife(0, -13)

    await openHub(wrapper)
    await wrapper.find('[aria-label="New game"]').trigger('click')

    expect(game.playerAt(0)?.life).toBe(20)
    expect(wrapper.findComponent(PlayerPanel).props('isFirstPlayer')).toBe(false)
  })

  it('picks and announces a random first player', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const wrapper = mount(App)

    await openHub(wrapper)
    await wrapper.find('[aria-label="Random first player"]').trigger('click')

    const overlay = wrapper.findComponent(StarterOverlay)
    expect(overlay.exists()).toBe(true)
    expect(overlay.props('player').id).toBe(1)
    expect(wrapper.findAllComponents(PlayerPanel)[1].props('isFirstPlayer')).toBe(true)

    await overlay.find('.starter').trigger('click')
    expect(wrapper.findComponent(StarterOverlay).exists()).toBe(false)
    // The crown stays on the table after the announcement is dismissed.
    expect(wrapper.findAllComponents(PlayerPanel)[1].props('isFirstPlayer')).toBe(true)
  })

  it('keeps life totals across a reload', async () => {
    const first = mount(App)
    await first.findAllComponents(PlayerPanel)[0].vm.$emit('life', -5)
    first.unmount()

    // A reload re-reads local storage; the shared store is rebuilt from it.
    const { resetGameStore } = await import('../../game/store')
    resetGameStore()
    const second = mount(App)

    expect(second.findAllComponents(PlayerPanel)[0].props('player').life).toBe(15)
  })
})
