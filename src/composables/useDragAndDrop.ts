import { ref, computed, onMounted, onBeforeUnmount, Ref } from 'vue'
import { useThrottle } from './useThrottle'
import type { CanvasImage, ImageUrl } from '../types/image.type'

const imageSize = 100

export function useDragAndDrop(
  canvasImage: Ref<CanvasImage[]>,
  canvas: Ref<HTMLElement | null>,
  selectedIndex: Ref<number | null>
) {
  const draggedImage = ref<ImageUrl | null>(null)
  const isDragging = ref(false)
  const draggingIndex = ref<number | null>(null)

  let offsetX = 0
  let offsetY = 0

  const onDragStart = (image: ImageUrl) => {
    draggedImage.value = image
  }

  const onDrop = (e: DragEvent) => {
    if (!canvas.value || !draggedImage.value) return

    const canvasRect = canvas.value.getBoundingClientRect()
    const x = e.clientX - canvasRect.left - imageSize / 2
    const y = e.clientY - canvasRect.top - imageSize / 2

    canvasImage.value.push({
      url: draggedImage.value,
      x,
      y,
      z: maxZIndex.value + 1,
    })

    draggedImage.value = null
  }

  const startDragging = (index: number, event: MouseEvent) => {
    draggedImage.value = null
    isDragging.value = true
    draggingIndex.value = index
    selectedIndex.value = index

    const image = canvasImage.value[index]
    offsetX = event.clientX - image.x
    offsetY = event.clientY - image.y

    window.addEventListener('mousemove', throttledOnDrag)
    window.addEventListener('mouseup', stopDragging)
  }

  const onDrag = (event: MouseEvent) => {
    if (isDragging.value && draggingIndex.value !== null) {
      const image = canvasImage.value[draggingIndex.value]
      image.x = event.clientX - offsetX
      image.y = event.clientY - offsetY
    }
  }

  const throttledOnDrag = useThrottle(onDrag)

  const stopDragging = () => {
    isDragging.value = false
    draggingIndex.value = null
    window.removeEventListener('mousemove', throttledOnDrag)
    window.removeEventListener('mouseup', stopDragging)
  }

  const maxZIndex = computed(() => Math.max(...canvasImage.value.map(img => img.z || 0)))

  const clearSelection = (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.canvas-image')) {
      selectedIndex.value = null
    }
  }

  onBeforeUnmount(() => {
    stopDragging()
  })

  return {
    onDragStart,
    onDrop,
    startDragging,
    clearSelection,
  }
}
