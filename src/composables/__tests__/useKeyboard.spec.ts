import { ref, defineComponent } from 'vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useKeyboard } from '../useKeyboard'
import type { CanvasImage } from '../../types/image.type'

describe('useKeyboard', () => {
  let canvasImage = ref<CanvasImage[]>([])
  let selectedIndex = ref<number | null>(null)
  const deleteImage = vi.fn()
  let wrapper: VueWrapper<any>

  const triggerKey = (key: string, shiftKey = false) => {
    const event = new KeyboardEvent('keydown', { key, shiftKey })
    window.dispatchEvent(event)
  }

  beforeEach(() => {
    canvasImage.value = [{ url: 'test.jpg', x: 0, y: 0, z: 0 }]
    selectedIndex.value = 0
    deleteImage.mockClear()

    wrapper = mount(
      defineComponent({
        setup() {
          useKeyboard(canvasImage, selectedIndex, deleteImage)
          return {}
        },
        template: '<div />',
      })
    )
  })

  afterEach(() => {
    wrapper.unmount() // clean up the listener
  })

  it('calls deleteImage on Delete key', () => {
    triggerKey('Delete')
    expect(deleteImage).toHaveBeenCalledWith(0)
  })

  it('calls deleteImage on Backspace key', () => {
    triggerKey('Backspace')
    expect(deleteImage).toHaveBeenCalledWith(0)
  })

  it('moves image up on ArrowUp', () => {
    triggerKey('ArrowUp')
    expect(canvasImage.value[0].y).toBe(-1)
  })

  it('moves image down fast on ArrowDown + shift', () => {
    triggerKey('ArrowDown', true)
    expect(canvasImage.value[0].y).toBe(10)
  })

  it('moves image left on ArrowLeft', () => {
    triggerKey('ArrowLeft')
    expect(canvasImage.value[0].x).toBe(-1)
  })

  it('moves image right fast on ArrowRight + shift', () => {
    triggerKey('ArrowRight', true)
    expect(canvasImage.value[0].x).toBe(10)
  })

  it('does nothing if selectedIndex is null', () => {
    selectedIndex.value = null
    triggerKey('Delete')
    expect(deleteImage).not.toHaveBeenCalled()
  })

  it('ignores unrelated keys', () => {
    triggerKey('Enter')
    expect(deleteImage).not.toHaveBeenCalled()
    expect(canvasImage.value[0].x).toBe(0)
    expect(canvasImage.value[0].y).toBe(0)
  })
})
