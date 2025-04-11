<template>
  <div class="app">
    <aside class="sidebar">
      <h2>Items</h2>
      <UploadButton class="upload-button" @uploaded="onUploaded" />
      <ul class="items">
        <img
          class="item"
          v-for="(image, index) in images"
          draggable="true"
          @dragstart="onDragStart(image)"
          :src="image"
          :key="index"
          loading="lazy"
          :alt="`Draggable image ${index}`"
        />
      </ul>
    </aside>

    <main class="main">
      <h1>Online Graphic Editor</h1>
      <div class="canvas-container">
        <div class="canvas" ref="canvas" @dragover.prevent @drop="onDrop" @mousedown="clearSelection">
          <div
            class="canvas-image"
            v-for="(image, index) in droppedImages"
            :class="{ selected: selectedIndex === index }"
            :key="index"
            :style="{ left: image.x + 'px', top: image.y + 'px' }"
            @mousedown="startDragging(index, $event)"
          >
            <img :src="image.path" draggable="false" />
            <button
              v-if="selectedIndex === index"
              class="delete-btn"
              @mousedown.stop
              loading="lazy"
              @click="deleteImage(index)"
            >
              x
            </button>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>&copy; {{ currentYear }} Truong Tong</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useThrottle } from './composables/useThrottle'
import UploadButton from './components/UploadButton.vue'
import { useLocalStorage } from '@vueuse/core'

const KEY_CANVAS_IMAGES = 'CANVAS_IMAGES'

const currentYear = new Date().getFullYear()

type ImagePath = string
const images = ref<ImagePath[]>([])

type DroppedImage = {
  path: ImagePath
  x: number
  y: number
}
const droppedImages = useLocalStorage<DroppedImage[]>(KEY_CANVAS_IMAGES, [], {
  // Compress the storage to store a large number of images
  serializer: {
    read: (value: string) => {
      try {
        return JSON.parse(decodeURIComponent(atob(value)))
      } catch {
        return []
      }
    },
    write: (value: DroppedImage[]) => {
      return btoa(encodeURIComponent(JSON.stringify(value)))
    },
  },
})

const draggedImage = ref<ImagePath | null>(null)
const canvas = ref<HTMLElement | null>(null)

const isDragging = ref<boolean>(false)
const draggingIndex = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)
let offsetX = 0
let offsetY = 0

onMounted(async () => {
  images.value = await fetchAllImages()
  console.log(images.value[0])
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const onUploaded = (url: string) => {
  images.value.push(url)
}

const fetchAllImages = async (): Promise<string[]> => {
  try {
    const res = await fetch('http://localhost:8000/images')
    if (!res.ok) throw new Error('Failed to fetch images')

    const images: string[] = await res.json()
    return images
  } catch (err) {
    console.error('Failed to load images:', err)
    return []
  }
}

const validKeyBoards = ['Delete', 'Backspace', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const
type KeyBoard = (typeof validKeyBoards)[number]

const handleKeydown = (e: KeyboardEvent) => {
  if (selectedIndex.value === null) return

  // For type-safe
  if (validKeyBoards.includes(e.key as KeyBoard)) {
    e.preventDefault()
    deleteSelectedImageOnDeleteOrBackspace(e)
    moveSelectedImageOnArrowKeys(e)
  }
}

const deleteSelectedImageOnDeleteOrBackspace = (e: KeyboardEvent) => {
  const key = e.key as KeyBoard
  if (key === 'Delete' || key === 'Backspace') {
    deleteImage(selectedIndex.value!!)
  }
}

const moveSelectedImageOnArrowKeys = (e: KeyboardEvent) => {
  const selectedImage = droppedImages.value[selectedIndex.value!!]
  const fastSpeedIfHoldingShift = 10
  const normalSpeed = 1
  const step = e.shiftKey ? fastSpeedIfHoldingShift : normalSpeed

  switch (e.key as KeyBoard) {
    case 'ArrowUp':
      selectedImage.y -= step
      break
    case 'ArrowDown':
      selectedImage.y += step
      break
    case 'ArrowLeft':
      selectedImage.x -= step
      break
    case 'ArrowRight':
      selectedImage.x += step
      break
  }
}

const onDragStart = (image: ImagePath) => {
  draggedImage.value = image
}

const onDrop = (e: DragEvent) => {
  if (!canvas.value || !draggedImage.value) return

  const canvasRect = canvas.value.getBoundingClientRect()
  const imageWidth = 100
  const imageHeight = 100

  const x = e.clientX - canvasRect.left - imageWidth / 2
  const y = e.clientY - canvasRect.top - imageHeight / 2

  droppedImages.value.push({
    path: draggedImage.value,
    x,
    y,
  })

  draggedImage.value = null
}

const startDragging = (index: number, event: MouseEvent) => {
  draggedImage.value = null
  isDragging.value = true
  draggingIndex.value = index
  selectedIndex.value = index

  const image = droppedImages.value[index]
  offsetX = event.clientX - image.x
  offsetY = event.clientY - image.y

  window.addEventListener('mousemove', throttledOnDrag)
  window.addEventListener('mouseup', stopDragging)
}

const onDrag = (event: MouseEvent) => {
  if (isDragging.value && draggingIndex.value !== null) {
    const image = droppedImages.value[draggingIndex.value]
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

const clearSelection = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.canvas-image') === null) {
    selectedIndex.value = null
  }
}

const deleteImage = (index: number) => {
  droppedImages.value.splice(index, 1)
  if (selectedIndex.value === index) {
    selectedIndex.value = null
  } else if (selectedIndex.value !== null && selectedIndex.value > index) {
    selectedIndex.value--
  }
}
</script>

<style scoped>
.app {
  display: grid;
  grid-template-areas:
    'sidebar main'
    'footer footer';
  grid-template-columns: 340px 1fr;
  grid-template-rows: 1fr auto;
  height: 100vh;
  width: 100%;
}

.sidebar {
  grid-area: sidebar;
  box-shadow: 0.125rem 0 1rem var(--color-box-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.upload-button {
  margin-top: 2rem;
}

.items {
  display: grid;
  width: 100%;
  gap: 0.25rem;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
}

div.item {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.item {
  width: 100px;
  height: 100px;
  object-fit: cover;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background-color: var(--color-bg-white);
  cursor: pointer;
}

.item:hover {
  background-color: var(--color-bg-grey);
}

.main {
  grid-area: main;
  background-color: var(--color-bg-grey);
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.main h1 {
  text-align: center;
}

.canvas-container {
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
}

.canvas {
  width: 90%;
  height: 90%;
  background-color: var(--color-white);
  box-shadow: 0.125rem 0 1rem var(--color-box-shadow);
  position: relative;
}

.canvas-image {
  position: absolute;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.canvas-image img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.canvas-image.selected {
  outline: 1px solid var(--color-primary);
  outline-offset: 2px;
  z-index: 10;
}

.delete-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: var(--color-error);
  color: var(--color-white);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  z-index: 20;
}
.delete-btn:hover {
  background: var(--color-error-hover);
}

.footer {
  grid-area: footer;
  text-align: center;
  padding: 2rem;
  background-color: #353254;
  color: var(--color-white);
}
</style>
