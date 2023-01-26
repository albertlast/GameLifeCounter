import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import SettingView from '../SettingView.vue'

test('mount SettingView', () => {
  expect(SettingView).toBeTruthy()

  const wrapper = mount(SettingView)

  expect(wrapper.text()).toContain('Fullscreen')
})
