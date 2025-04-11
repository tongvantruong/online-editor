<template>
  <div class="app">
    <aside class="sidebar">
      <h2>Items</h2>
      <div>Add files</div>
      <ul class="items">
        <img
          class="item"
          v-for="(image, index) in images"
          draggable="true"
          @dragstart="onDragStart(image)"
          :src="image"
          :key="index"
          :alt="`Image ${index}`"
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
import { ref } from 'vue'
import { useThrottle } from './composables/useThrottle'

const currentYear = new Date().getFullYear()

type ImagePath = string
const imageModules: Record<string, ImagePath> = import.meta.glob('./assets/images/*.{png,jpg,jpeg,gif,svg}', {
  eager: true,
  import: 'default',
})
const images: ImagePath[] = Object.values(imageModules)

type DroppedImage = {
  path: ImagePath
  x: number
  y: number
}
const droppedImages = ref<DroppedImage[]>([])
const draggedImage = ref<ImagePath | null>(null)
const canvas = ref<HTMLElement | null>(null)

const isDragging = ref<boolean>(false)
const draggingIndex = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)
let offsetX = 0
let offsetY = 0

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
}

.items {
  padding: 1rem;
  display: grid;
  width: 100%;
  gap: 0.25rem;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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
  outline: 1px solid var(--color-selected);
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
