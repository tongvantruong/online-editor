import { mount } from '@vue/test-utils'
import ContextMenu, { MenuItem } from '../ContextMenu.vue'
import { describe, expect, it, vi } from 'vitest'

const visible = true
const mockDeleteAction = vi.fn()
const mockDuplicateAction = vi.fn()
const actions: MenuItem[] = [
  {
    icon: '❌',
    label: 'Delete',
    action: mockDeleteAction,
  },
  {
    icon: '📄',
    label: 'Duplicate',
    action: mockDuplicateAction,
  },
]

describe('ContextMenu', () => {
  it('renders Delete icon and label', () => {
    const wrapper = mount(ContextMenu, {
      props: { visible, actions },
    })
    const deleteItem = wrapper.findAll('.context-menu-item')[0]
    expect(deleteItem.text()).toBe(`${actions[0].icon}${actions[0].label}`)
  })
  it('renders Duplicate icon and label', () => {
    const wrapper = mount(ContextMenu, {
      props: { visible, actions },
    })
    const duplicateItem = wrapper.findAll('.context-menu-item')[1]
    expect(duplicateItem.text()).toBe(`${actions[1].icon}${actions[1].label}`)
  })
  it('calls Delete action when clicked Delete', () => {
    const wrapper = mount(ContextMenu, {
      props: { visible, actions },
    })
    wrapper.findAll('.context-menu-item')[0].trigger('click')
    expect(mockDeleteAction).toHaveBeenCalledOnce()
  })
  it('calls Duplicate action when clicked Duplicate', () => {
    const wrapper = mount(ContextMenu, {
      props: { visible, actions },
    })
    wrapper.findAll('.context-menu-item')[1].trigger('click')
    expect(mockDuplicateAction).toHaveBeenCalledOnce()
  })
})
