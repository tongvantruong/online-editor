import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UploadButton from '../UploadButton.vue'

describe('UploadButton.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(UploadButton, {
      attachTo: document.body, // For input click to work
    })
  })

  it('calls file input click when area is clicked', async () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click')
    await wrapper.find('.upload-area').trigger('click')
    expect(clickSpy).toHaveBeenCalled()
  })

  it('sets isDraggingOver true on dragover', async () => {
    await wrapper.trigger('dragover')
    expect(wrapper.classes()).toContain('drag-over')
  })

  it('sets isDraggingOver false on dragleave', async () => {
    await wrapper.trigger('dragover')
    await wrapper.trigger('dragleave')
    expect(wrapper.classes()).not.toContain('drag-over')
  })
})
