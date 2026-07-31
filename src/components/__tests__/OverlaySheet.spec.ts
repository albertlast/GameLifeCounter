import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OverlaySheet from '../OverlaySheet.vue'

const mountSheet = () =>
  mount(OverlaySheet, {
    props: { title: 'Dice', subtitle: 'Settle it with a roll' },
    slots: { default: '<p class="content">body</p>' },
    attachTo: document.body,
  })

describe('OverlaySheet', () => {
  it('renders as a labelled modal with its content', () => {
    const wrapper = mountSheet()

    expect(wrapper.find('[role="dialog"]').attributes('aria-label')).toBe('Dice')
    expect(wrapper.find('.sheet__title').text()).toBe('Dice')
    expect(wrapper.find('.sheet__subtitle').text()).toBe('Settle it with a roll')
    expect(wrapper.find('.content').text()).toBe('body')
  })

  it('closes on the backdrop, the close button and Escape', async () => {
    const backdrop = mountSheet()
    await backdrop.find('.overlay__backdrop').trigger('click')
    expect(backdrop.emitted('close')).toHaveLength(1)

    const button = mountSheet()
    await button.find('.sheet__close').trigger('click')
    expect(button.emitted('close')).toHaveLength(1)

    const escape = mountSheet()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(escape.emitted('close')).toHaveLength(1)
  })

  it('stops listening for Escape once unmounted', async () => {
    const wrapper = mountSheet()
    wrapper.unmount()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('leaves out the subtitle when there is none', () => {
    const wrapper = mount(OverlaySheet, { props: { title: 'Settings' } })

    expect(wrapper.find('.sheet__subtitle').exists()).toBe(false)
  })
})
