import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ControlHub from '../ControlHub.vue'

describe('ControlHub', () => {
  it('starts collapsed with the actions out of the tab order', () => {
    const wrapper = mount(ControlHub)

    expect(wrapper.find('.hub').attributes('data-open')).toBe('false')
    expect(wrapper.find('.hub__toggle').attributes('aria-expanded')).toBe('false')
    expect(
      wrapper.findAll('.hub__action').every((action) => action.attributes('tabindex') === '-1'),
    ).toBe(true)
  })

  it('makes the closed ring inert rather than aria-hidden', async () => {
    // aria-hidden on the ring is invalid: it keeps focus after an action is
    // picked, and hiding a focused element from assistive tech is an error.
    // The binding resolves to `undefined` when open so the attribute is really
    // removed: a literal `inert="false"` would still make the ring inert.
    const wrapper = mount(ControlHub)
    const inert = () => wrapper.find('.hub__ring').attributes('inert')

    expect(inert()).toBeDefined()
    expect(wrapper.find('.hub__ring').attributes('aria-hidden')).toBeUndefined()

    await wrapper.find('.hub__toggle').trigger('click')

    expect(inert()).toBeUndefined()
  })

  it('opens and closes the ring', async () => {
    const wrapper = mount(ControlHub)

    await wrapper.find('.hub__toggle').trigger('click')
    expect(wrapper.find('.hub').attributes('data-open')).toBe('true')

    await wrapper.find('.hub__backdrop').trigger('click')
    expect(wrapper.find('.hub').attributes('data-open')).toBe('false')
  })

  it('offers every table action', () => {
    const wrapper = mount(ControlHub)
    const labels = wrapper.findAll('.hub__action').map((action) => action.attributes('aria-label'))

    expect(labels).toEqual([
      'Settings',
      'Roll dice',
      'Match timer',
      'Random first player',
      'New game',
    ])
  })

  it('spreads the actions evenly around the centre', () => {
    const wrapper = mount(ControlHub)
    const angles = wrapper.findAll('.hub__action').map((action) => action.attributes('style') ?? '')

    expect(angles[0]).toContain('--angle: -90deg')
    expect(angles[1]).toContain('--angle: -18deg')
  })

  it('emits the chosen action and collapses again', async () => {
    const wrapper = mount(ControlHub)
    await wrapper.find('.hub__toggle').trigger('click')

    await wrapper.find('[aria-label="Roll dice"]').trigger('click')

    expect(wrapper.emitted('action')).toEqual([['dice']])
    expect(wrapper.find('.hub').attributes('data-open')).toBe('false')
  })
})
