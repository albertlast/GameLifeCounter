import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StarterOverlay from '../StarterOverlay.vue'
import type { Player } from '../../game/types'

const player: Player = {
  id: 2,
  name: 'Grace',
  hue: 140,
  life: 40,
  counters: { poison: 0, energy: 0 },
}

describe('StarterOverlay', () => {
  it('announces the chosen player in their colour', () => {
    const wrapper = mount(StarterOverlay, { props: { player } })

    expect(wrapper.find('.starter__name').text()).toBe('Grace')
    expect(wrapper.find('[role="dialog"]').attributes('aria-label')).toBe('Grace starts')
    expect(wrapper.find('.starter__card').attributes('style')).toContain('--player-hue: 140')
  })

  it('dismisses on tap', async () => {
    const wrapper = mount(StarterOverlay, { props: { player } })

    await wrapper.find('.starter').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
