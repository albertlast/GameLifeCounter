import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import PlayerPanel from '../PlayerPanel.vue'
import type { Player } from '../../game/types'

const makePlayer = (overrides: Partial<Player> = {}): Player =>
  reactive({
    id: 0,
    name: 'Ada',
    hue: 200,
    life: 20,
    counters: { poison: 0, energy: 0 },
    ...overrides,
  })

const mountPanel = (props: Record<string, unknown> = {}) =>
  mount(PlayerPanel, { props: { player: makePlayer(), ...props } })

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('PlayerPanel', () => {
  it('shows the player name and life total', () => {
    const wrapper = mountPanel()

    expect(wrapper.find('.name').text()).toContain('Ada')
    expect(wrapper.find('.life').text()).toBe('20')
    expect(wrapper.find('section').attributes('aria-label')).toBe('Ada: 20 life')
  })

  it('exposes the player hue and digit count to the theme', () => {
    const wrapper = mountPanel({ player: makePlayer({ life: 8000, hue: 120 }) })
    const style = wrapper.find('section').attributes('style') ?? ''

    expect(style).toContain('--player-hue: 120')
    expect(style).toContain('--digits: 4')
  })

  it('applies a single step on a tap', async () => {
    const wrapper = mountPanel()

    await wrapper.find('.zone--minus').trigger('pointerdown')
    await wrapper.find('.zone--minus').trigger('pointerup')

    expect(wrapper.emitted('life')).toEqual([[-1]])
  })

  it('applies the big step repeatedly while held', async () => {
    const wrapper = mountPanel({ step: 1, bigStep: 10 })

    await wrapper.find('.zone--plus').trigger('pointerdown')
    vi.advanceTimersByTime(500)
    vi.advanceTimersByTime(360)
    await wrapper.find('.zone--plus').trigger('pointerup')

    expect(wrapper.emitted('life')).toEqual([[10], [10], [10]])
  })

  it('does not let a second finger on the same button add a step', async () => {
    const wrapper = mountPanel()
    const minus = wrapper.find('.zone--minus')

    await minus.trigger('pointerdown', { pointerId: 1 })
    await minus.trigger('pointerdown', { pointerId: 2 })
    await minus.trigger('pointerup', { pointerId: 2 })
    await minus.trigger('pointerup', { pointerId: 1 })

    expect(wrapper.emitted('life')).toEqual([[-1]])
  })

  it('keeps the two life buttons independent for simultaneous touches', async () => {
    const wrapper = mountPanel()

    await wrapper.find('.zone--minus').trigger('pointerdown', { pointerId: 1 })
    await wrapper.find('.zone--plus').trigger('pointerdown', { pointerId: 2 })
    await wrapper.find('.zone--plus').trigger('pointerup', { pointerId: 2 })
    await wrapper.find('.zone--minus').trigger('pointerup', { pointerId: 1 })

    expect(wrapper.emitted('life')).toEqual([[1], [-1]])
  })

  it('drops a press that is cancelled by the browser', async () => {
    const wrapper = mountPanel()

    await wrapper.find('.zone--minus').trigger('pointerdown')
    await wrapper.find('.zone--minus').trigger('pointercancel')
    vi.advanceTimersByTime(2000)

    expect(wrapper.emitted('life')).toBeUndefined()
  })

  it('supports the keyboard', async () => {
    const wrapper = mountPanel({ step: 5 })

    await wrapper.find('.zone--plus').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('life')).toEqual([[5]])
  })

  it('shows the running total of recent changes and fades it out', async () => {
    const wrapper = mountPanel()
    const minus = wrapper.find('.zone--minus')

    await minus.trigger('pointerdown')
    await minus.trigger('pointerup')
    await minus.trigger('pointerdown')
    await minus.trigger('pointerup')
    await nextTick()

    const delta = wrapper.find('.delta')
    expect(delta.text()).toBe('-2')
    expect(delta.classes()).toContain('delta--visible')

    vi.advanceTimersByTime(2500)
    await nextTick()

    expect(wrapper.find('.delta').classes()).not.toContain('delta--visible')
  })

  it('hides the counters unless the preset uses them', () => {
    expect(mountPanel().find('.chips').exists()).toBe(false)
    expect(
      mountPanel({ counters: ['poison'] })
        .find('.chips')
        .exists(),
    ).toBe(true)
  })

  it('emits counter changes in both directions', async () => {
    const wrapper = mountPanel({ counters: ['poison', 'energy'] })
    const chips = wrapper.findAll('.chip')

    expect(chips).toHaveLength(2)
    await chips[0].findAll('button')[1].trigger('click')
    await chips[1].findAll('button')[0].trigger('click')

    expect(wrapper.emitted('counter')).toEqual([
      ['poison', 1],
      ['energy', -1],
    ])
  })

  it('marks the randomly picked starting player', () => {
    expect(mountPanel().find('.name__crown').exists()).toBe(false)
    expect(mountPanel({ isFirstPlayer: true }).find('.name__crown').exists()).toBe(true)
    expect(mountPanel({ isFirstPlayer: true }).find('section').attributes('data-first')).toBe(
      'true',
    )
  })

  it('clears a stale delta when a new game resets the life total', async () => {
    const player = makePlayer({ life: 20 })
    const wrapper = mountPanel({ player })

    await wrapper.find('.zone--minus').trigger('pointerdown')
    await wrapper.find('.zone--minus').trigger('pointerup')
    player.life = 8000
    await nextTick()

    expect(wrapper.find('.delta').classes()).not.toContain('delta--visible')
  })
})
