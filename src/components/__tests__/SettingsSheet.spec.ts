import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SettingsSheet from '../SettingsSheet.vue'
import LayoutPreview from '../LayoutPreview.vue'
import { createGameStore } from '../../game/store'
import { GAME_STORE_KEY } from '../../game/inject'

const mountSheet = (store = createGameStore()) => ({
  store,
  wrapper: mount(SettingsSheet, {
    global: { provide: { [GAME_STORE_KEY as symbol]: store } },
  }),
})

describe('SettingsSheet', () => {
  it('offers every supported player count and marks the current one', () => {
    const { wrapper } = mountSheet()
    const buttons = wrapper.findAll('.segmented__item')

    expect(buttons.map((button) => button.text())).toEqual(['2', '3', '4', '5', '6'])
    expect(buttons[0].attributes('aria-pressed')).toBe('true')
  })

  it('asks for the layout right after the player count is chosen', async () => {
    const { store, wrapper } = mountSheet()

    await wrapper.findAll('.segmented__item')[2].trigger('click')

    expect(store.state.playerCount).toBe(4)
    expect(wrapper.find('[role="dialog"]').attributes('aria-label')).toBe('Table layout')
    // The table stays readable behind the layout step so it previews live.
    expect(wrapper.find('.overlay').attributes('data-preview')).toBe('true')
  })

  it('applies a layout from the layout step and shows which one is active', async () => {
    const { store, wrapper } = mountSheet()
    await wrapper.findAll('.segmented__item')[4].trigger('click')

    const options = wrapper.findAll('.option')
    expect(options.map((option) => option.find('.option__name').text())).toEqual([
      'Facing',
      'Sides',
      'Same side',
    ])
    expect(options[0].attributes('aria-pressed')).toBe('true')

    await options[1].trigger('click')

    expect(store.state.layoutId).toBe('sides')
    expect(wrapper.findAll('.option')[1].attributes('aria-pressed')).toBe('true')
  })

  it('draws a seat diagram per layout option', async () => {
    const { wrapper } = mountSheet()
    await wrapper.findAll('.segmented__item')[0].trigger('click')

    const diagrams = wrapper.findAllComponents(LayoutPreview)
    expect(diagrams).toHaveLength(3)
    expect(
      diagrams[0].findAll('.preview__seat').map((seat) => seat.attributes('data-edge')),
    ).toEqual(['top', 'bottom'])
    expect(
      diagrams[1].findAll('.preview__seat').map((seat) => seat.attributes('data-edge')),
    ).toEqual(['left', 'right'])
  })

  it('goes back to the settings page from the layout step', async () => {
    const { wrapper } = mountSheet()
    await wrapper.findAll('.segmented__item')[1].trigger('click')

    await wrapper.find('.sheet__close').trigger('click')

    expect(wrapper.find('[role="dialog"]').attributes('aria-label')).toBe('Settings')
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('closes everything from Done on the layout step', async () => {
    const { wrapper } = mountSheet()
    await wrapper.findAll('.segmented__item')[1].trigger('click')

    await wrapper.find('.action').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('opens the layout step from the settings row without changing the count', async () => {
    const { store, wrapper } = mountSheet()

    await wrapper.find('.layout-row').trigger('click')

    expect(store.state.playerCount).toBe(2)
    expect(wrapper.find('[role="dialog"]').attributes('aria-label')).toBe('Table layout')
  })

  it('applies a preset and restarts the game', async () => {
    const { store, wrapper } = mountSheet()
    store.adjustLife(0, -8)

    const commander = wrapper.findAll('.option')[1]
    await commander.trigger('click')

    expect(store.state.presetId).toBe('commander')
    expect(store.state.startingLife).toBe(40)
    expect(store.playerAt(0)?.life).toBe(40)
  })

  it('steps the starting life up and down', async () => {
    const { store, wrapper } = mountSheet()
    const steps = wrapper.findAll('.stepper__button')

    await steps[0].trigger('click') // -10
    await steps[3].trigger('click') // +10
    await steps[2].trigger('click') // +1

    expect(store.state.startingLife).toBe(21)
    expect(wrapper.find('.stepper__value').text()).toBe('21')
  })

  it('starts a new game and closes', async () => {
    const { store, wrapper } = mountSheet()
    store.adjustLife(1, -6)

    await wrapper.find('.action').trigger('click')

    expect(store.playerAt(1)?.life).toBe(20)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('switches the theme', async () => {
    const { store, wrapper } = mountSheet()

    await wrapper.findAll('.theme')[1].trigger('click')

    expect(store.state.themeId).toBe('arena')
    expect(wrapper.findAll('.theme')[1].attributes('aria-pressed')).toBe('true')
  })

  it('lists only the seated players for renaming and recolouring', async () => {
    const store = createGameStore({ playerCount: 3 })
    const { wrapper } = mountSheet(store)

    expect(wrapper.findAll('.player')).toHaveLength(3)

    const nameInput = wrapper.findAll('.player__name')[1]
    await nameInput.setValue('Grace')
    await nameInput.trigger('change')
    expect(store.playerAt(1)?.name).toBe('Grace')

    const hueInput = wrapper.findAll('.player__hue')[0]
    await hueInput.setValue('300')
    expect(store.playerAt(0)?.hue).toBe(300)
  })

  it('restores the default colours', async () => {
    const { store, wrapper } = mountSheet()
    store.setHue(0, 5)

    await wrapper.find('.link').trigger('click')

    expect(store.playerAt(0)?.hue).toBe(32)
  })

  it('hides display toggles the browser cannot do', () => {
    const { wrapper } = mountSheet()

    expect(wrapper.findAll('.toggle')).toHaveLength(0)
  })

  it('closes when asked', async () => {
    const { wrapper } = mountSheet()

    await wrapper.find('.sheet__close').trigger('click')

    await nextTick()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
