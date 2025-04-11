import { ref, onMounted, onUnmounted } from 'vue'

export function useContextMenu<T = unknown>() {
  const visible = ref(false)
  const position = ref({ x: 0, y: 0 })
  const target = ref<T | null>(null)

  const show = (e: MouseEvent, item: T) => {
    e.preventDefault()
    visible.value = true
    position.value = { x: e.clientX, y: e.clientY }
    target.value = item
  }

  const hide = () => {
    visible.value = false
    target.value = null
  }

  const handleGlobalClick = (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.context-menu')) {
      hide()
    }
  }

  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') hide()
  }

  onMounted(() => {
    window.addEventListener('click', handleGlobalClick)
    window.addEventListener('keydown', handleEsc)
  })

  onUnmounted(() => {
    window.removeEventListener('click', handleGlobalClick)
    window.removeEventListener('keydown', handleEsc)
  })

  return {
    visible,
    position,
    target,
    show,
    hide,
  }
}
