import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, it, expect, vi } from 'vitest'
import { useContextMenu } from '../useContextMenu'

describe('useContextMenu', () => {
  it('shows context menu with correct position and target', async () => {
    let contextMenu!: ReturnType<typeof useContextMenu<number>>

    const TestComponent = defineComponent({
      setup() {
        contextMenu = useContextMenu<number>()
        return () =>
          h('div', {
            onContextmenu: (e: MouseEvent) => contextMenu.show(e, 1),
          })
      },
    })

    const wrapper = mount(TestComponent)

    await wrapper.trigger('contextmenu', {
      clientX: 100,
      clientY: 150,
    })

    expect(contextMenu.visible.value).toBe(true)
    expect(contextMenu.position.value).toEqual({ x: 100, y: 150 })
    expect(contextMenu.target.value).toBe(1)
  })

  it('hides when Escape key is pressed', async () => {
    let contextMenu: ReturnType<typeof useContextMenu<number>>

    const TestComponent = defineComponent({
      setup() {
        contextMenu = useContextMenu<number>()
        contextMenu.visible.value = true
        contextMenu.target.value = 1
        return () => null
      },
    })

    mount(TestComponent)

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    window.dispatchEvent(escEvent)

    expect(contextMenu!.visible.value).toBe(false)
    expect(contextMenu!.target.value).toBe(null)
  })

  it('hides when clicking outside of .context-menu', async () => {
    let contextMenu: ReturnType<typeof useContextMenu<number>>

    const TestComponent = defineComponent({
      setup() {
        contextMenu = useContextMenu<number>()
        contextMenu.visible.value = true
        contextMenu.target.value = 1
        return () => null
      },
    })

    mount(TestComponent)

    // Simulate click outside context-menu
    const target = document.createElement('div') // not .context-menu
    const clickOutside = new MouseEvent('click', { bubbles: true })

    Object.defineProperty(clickOutside, 'target', {
      value: target,
    })

    window.dispatchEvent(clickOutside)

    expect(contextMenu!.visible.value).toBe(false)
    expect(contextMenu!.target.value).toBe(null)
  })

  it('does not hide when clicking inside .context-menu', () => {
    const contextMenu = useContextMenu<number>()
    contextMenu.visible.value = true
    contextMenu.target.value = 1

    const contextDiv = document.createElement('div')
    contextDiv.classList.add('context-menu')

    const clickInside = new MouseEvent('click', { bubbles: true })
    Object.defineProperty(clickInside, 'target', { value: contextDiv })

    window.dispatchEvent(clickInside)

    expect(contextMenu.visible.value).toBe(true)
    expect(contextMenu.target.value).toBe(1)
  })
})
