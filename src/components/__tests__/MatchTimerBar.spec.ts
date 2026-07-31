import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MatchTimerBar from '../MatchTimerBar.vue'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('MatchTimerBar', () => {
  it('starts at zero and paused', () => {
    const wrapper = mount(MatchTimerBar)

    expect(wrapper.find('.timer__value').text()).toBe('00:00')
    expect(wrapper.find('.timer__glyph').attributes('data-running')).toBe('false')
    expect(wrapper.find('[aria-label="Start timer"]').exists()).toBe(true)
  })

  it('runs, pauses and resets', async () => {
    const wrapper = mount(MatchTimerBar)

    await wrapper.find('[aria-label="Start timer"]').trigger('click')
    vi.advanceTimersByTime(62_000)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.timer__value').text()).toBe('01:02')
    expect(wrapper.find('.timer__glyph').attributes('data-running')).toBe('true')

    await wrapper.find('[aria-label="Pause timer"]').trigger('click')
    vi.advanceTimersByTime(10_000)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.timer__value').text()).toBe('01:02')

    await wrapper.find('[aria-label="Reset timer"]').trigger('click')
    expect(wrapper.find('.timer__value').text()).toBe('00:00')
  })

  it('asks to be hidden', async () => {
    const wrapper = mount(MatchTimerBar)

    await wrapper.find('[aria-label="Hide timer"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
