import { onMounted, onBeforeUnmount, Ref } from 'vue'
import type { CanvasImage } from '../types/image.type'

const NORMAL_MOVE_STEP = 1
const FAST_MOVE_STEP = 10

const validKeys = ['Delete', 'Backspace', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const
type KeyBoard = (typeof validKeys)[number]

export function useKeyboard(
  canvasImage: Ref<CanvasImage[]>,
  selectedIndex: Ref<number | null>,
  deleteImage: (index: number) => void
) {
  const handleKeydown = (e: KeyboardEvent) => {
    if (selectedIndex.value === null) return
    if (!validKeys.includes(e.key as KeyBoard)) return

    e.preventDefault()
    const key = e.key as KeyBoard

    if (key === 'Delete' || key === 'Backspace') {
      deleteImage(selectedIndex.value)
    } else {
      moveImageOnArrowKeys(e, key)
    }
  }

  const moveImageOnArrowKeys = (e: KeyboardEvent, key: KeyBoard) => {
    const image = canvasImage.value[selectedIndex.value!!]
    const step = e.shiftKey ? FAST_MOVE_STEP : NORMAL_MOVE_STEP
    switch (key) {
      case 'ArrowUp':
        image.y -= step
        break
      case 'ArrowDown':
        image.y += step
        break
      case 'ArrowLeft':
        image.x -= step
        break
      case 'ArrowRight':
        image.x += step
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
