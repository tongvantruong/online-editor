import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { CanvasImage } from '../../types/image.type'
import { useDragAndDrop } from '../useDragAndDrop'

// Mock throttle to avoid delay in tests
vi.mock('@/composables/useThrottle', () => ({
  useThrottle: (fn: Function) => fn,
}))

describe('useDragAndDrop', () => {
  let canvasImage = ref<CanvasImage[]>([])
  let canvas = ref<HTMLElement | null>(null)
  let selectedIndex = ref<number | null>(null)

  const imageUrl = 'https://example.com/image.jpg'

  beforeEach(() => {
    canvasImage.value = []
    selectedIndex.value = null
    canvas.value = document.createElement('div')
    Object.defineProperty(canvas.value, 'getBoundingClientRect', {
      value: () => ({ left: 10, top: 20 }),
    })
  })

  it('sets draggedImage on drag start', () => {
    const { onDragStart } = useDragAndDrop(canvasImage, canvas, selectedIndex)
    onDragStart(imageUrl)
    expect(canvasImage.value).toEqual([])
  })

  it('adds image to canvasImage on drop', () => {
    const { onDragStart, onDrop } = useDragAndDrop(canvasImage, canvas, selectedIndex)
    const mockEvent = {
      clientX: 110,
      clientY: 120,
    } as DragEvent

    onDragStart(imageUrl)
    onDrop(mockEvent)

    expect(canvasImage.value.length).toBe(1)
    expect(canvasImage.value[0]).toMatchObject({
      url: imageUrl,
      x: 110 - 10 - 50,
      y: 120 - 20 - 50,
    })
  })

  it('starts dragging image and track offsets', () => {
    const { startDragging } = useDragAndDrop(canvasImage, canvas, selectedIndex)
    canvasImage.value = [
      {
        url: imageUrl,
        x: 50,
        y: 50,
        z: 1,
      },
    ]

    const event = new MouseEvent('mousedown', {
      clientX: 70,
      clientY: 80,
    })

    startDragging(0, event)

    expect(selectedIndex.value).toBe(0)
  })

  it('clears selection when clicking outside image', () => {
    const { clearSelection } = useDragAndDrop(canvasImage, canvas, selectedIndex)
    selectedIndex.value = 2

    const event = {
      target: document.createElement('div'),
    } as unknown as MouseEvent

    clearSelection(event)
    expect(selectedIndex.value).toBe(null)
  })

  it('does NOT clear selection when clicking on .canvas-image', () => {
    const { clearSelection } = useDragAndDrop(canvasImage, canvas, selectedIndex)
    selectedIndex.value = 2

    const target = document.createElement('div')
    target.classList.add('canvas-image')
    const event = {
      target,
    } as unknown as MouseEvent

    clearSelection(event)
    expect(selectedIndex.value).toBe(2)
  })
})
