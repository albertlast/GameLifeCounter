import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DiceSheet from '../DiceSheet.vue'

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('DiceSheet', () => {
  it('offers a coin plus the usual dice', () => {
    const wrapper = mount(DiceSheet)

    expect(wrapper.findAll('.die').map((die) => die.text())).toEqual([
      'Coin',
      'd4',
      'd6',
      'd8',
      'd10',
      'd12',
      'd20',
      'd100',
    ])
  })

  it('waits for the first roll before showing a result', () => {
    const wrapper = mount(DiceSheet)

    expect(wrapper.find('.result__value').text()).toBe('—')
    expect(wrapper.find('.result__hint').text()).toBe('Pick a die')
  })

  it('shows the rolled value and which die produced it', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const wrapper = mount(DiceSheet)

    await wrapper.findAll('.die')[6].trigger('click')

    expect(wrapper.find('.result__value').text()).toBe('11')
    expect(wrapper.find('.result__hint').text()).toBe('d20 · 1–20')
  })

  it('reads a two sided die as a coin flip', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
    const wrapper = mount(DiceSheet)

    await wrapper.findAll('.die')[0].trigger('click')

    expect(wrapper.find('.result__value').text()).toBe('Heads')
  })

  it('keeps earlier rolls out of the way until there are some', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const wrapper = mount(DiceSheet)

    await wrapper.findAll('.die')[2].trigger('click')
    expect(wrapper.find('.history').exists()).toBe(false)

    await wrapper.findAll('.die')[2].trigger('click')
    expect(wrapper.findAll('.history__item')).toHaveLength(1)
    expect(wrapper.find('.history__item').text()).toBe('d6: 4')
  })

  it('closes from the sheet header', async () => {
    const wrapper = mount(DiceSheet)

    await wrapper.find('.sheet__close').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
