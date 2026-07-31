import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useFullscreen, useWakeLock } from '../useScreen'

const harness = <T>(composable: () => T) =>
  mount(
    defineComponent({
      setup: () => ({ api: composable() }),
      template: '<div />',
    }),
  )

const stubFullscreenApi = () => {
  const requestFullscreen = vi.fn(async () => {
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
      configurable: true,
    })
  })
  const exitFullscreen = vi.fn(async () => {
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true })
  })

  Object.defineProperty(document.documentElement, 'requestFullscreen', {
    value: requestFullscreen,
    configurable: true,
  })
  Object.defineProperty(document, 'exitFullscreen', { value: exitFullscreen, configurable: true })
  Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true })

  return { requestFullscreen, exitFullscreen }
}

afterEach(() => {
  Reflect.deleteProperty(document.documentElement, 'requestFullscreen')
  Reflect.deleteProperty(document, 'exitFullscreen')
  Reflect.deleteProperty(navigator, 'wakeLock')
})

describe('useFullscreen', () => {
  it('reports no support when the browser lacks the API', () => {
    const wrapper = harness(() => useFullscreen())

    expect(wrapper.vm.api.supported.value).toBe(false)
  })

  it('enters and leaves fullscreen', async () => {
    const { requestFullscreen, exitFullscreen } = stubFullscreenApi()
    const wrapper = harness(() => useFullscreen())

    expect(wrapper.vm.api.supported.value).toBe(true)

    await wrapper.vm.api.toggle()
    expect(requestFullscreen).toHaveBeenCalled()
    expect(wrapper.vm.api.isFullscreen.value).toBe(true)

    await wrapper.vm.api.toggle()
    expect(exitFullscreen).toHaveBeenCalled()
    expect(wrapper.vm.api.isFullscreen.value).toBe(false)
  })

  it('follows fullscreen changes made outside the app', async () => {
    stubFullscreenApi()
    const wrapper = harness(() => useFullscreen())

    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
      configurable: true,
    })
    document.dispatchEvent(new Event('fullscreenchange'))

    expect(wrapper.vm.api.isFullscreen.value).toBe(true)
  })

  it('surfaces a rejected request instead of throwing', async () => {
    stubFullscreenApi()
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: vi.fn(async () => {
        throw new Error('denied')
      }),
      configurable: true,
    })

    const wrapper = harness(() => useFullscreen())
    await wrapper.vm.api.toggle()

    expect(wrapper.vm.api.error.value).toBe('denied')
    expect(wrapper.vm.api.isFullscreen.value).toBe(false)
  })
})

describe('useWakeLock', () => {
  const stubWakeLock = (request: () => Promise<unknown>) => {
    Object.defineProperty(navigator, 'wakeLock', { value: { request }, configurable: true })
  }

  const fakeSentinel = () => {
    const listeners: (() => void)[] = []
    return {
      release: vi.fn(async () => listeners.forEach((listener) => listener())),
      addEventListener: (_type: string, listener: () => void) => listeners.push(listener),
    }
  }

  it('reports no support when the browser lacks the API', () => {
    const wrapper = harness(() => useWakeLock())

    expect(wrapper.vm.api.supported.value).toBe(false)
  })

  it('acquires and releases the lock', async () => {
    const sentinel = fakeSentinel()
    stubWakeLock(async () => sentinel)
    const wrapper = harness(() => useWakeLock())

    await wrapper.vm.api.toggle()
    expect(wrapper.vm.api.active.value).toBe(true)

    await wrapper.vm.api.toggle()
    expect(sentinel.release).toHaveBeenCalled()
    expect(wrapper.vm.api.active.value).toBe(false)
  })

  it('goes inactive when the browser releases the lock itself', async () => {
    const sentinel = fakeSentinel()
    stubWakeLock(async () => sentinel)
    const wrapper = harness(() => useWakeLock())

    await wrapper.vm.api.toggle()
    await sentinel.release()

    expect(wrapper.vm.api.active.value).toBe(false)
  })

  it('keeps the error message when the request is denied', async () => {
    stubWakeLock(async () => {
      const error = new Error('not allowed')
      error.name = 'NotAllowedError'
      throw error
    })
    const wrapper = harness(() => useWakeLock())

    await wrapper.vm.api.toggle()

    expect(wrapper.vm.api.active.value).toBe(false)
    expect(wrapper.vm.api.error.value).toContain('NotAllowedError')
  })
})
