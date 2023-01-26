import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import PlayerView from '../PlayerView.vue'

test('moount Calc', () => {
  expect(PlayerView).toBeTruthy()

  const wrapper = mount(PlayerView)

  expect(wrapper.text()).toContain('Average error')
})