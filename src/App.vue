<template>
  <div class="app">
    <aside class="sidebar">
      <h2>Items</h2>
      <UploadButton class="upload-button" @uploaded="onUploaded" />
      <p v-if="loading">Loading...</p>
      <p v-else-if="error">{{ error }}</p>
      <ul v-else class="items">
        <img
          class="item"
          v-for="(image, index) in images"
          draggable="true"
          @dragstart="onDragStart(image)"
          :src="image"
          :key="index"
          loading="lazy"
          :alt="`Draggable image ${index}`"
          role="listitem"
        />
      </ul>
    </aside>

    <main class="main">
      <h1>Online Graphic Editor</h1>
      <div class="canvas-container">
        <div
          class="canvas"
          ref="canvas"
          @dragover.prevent
          @drop="onDrop"
          @mousedown="clearSelection"
          role="list"
        >
          <div
            class="canvas-image"
            v-for="(image, index) in canvasImage"
            :class="{ selected: selectedIndex === index }"
            :key="index"
            :style="getCanvasImageStyle(image)"
            @mousedown="startDragging(index, $event)"
            @contextmenu="showContextMenu($event, index)"
            role="listitem"
          >
            <img :src="image.url" draggable="false" :alt="`Image ${index}`" />
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>&copy; {{ currentYear }} Truong Tong</p>
    </footer>
    <ContextMenu :x="contextPosition.x" :y="contextPosition.y" :visible="contextVisible" :actions="actions" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useThrottle } from './composables/useThrottle'
import UploadButton from './components/UploadButton.vue'
import ContextMenu from './components/ContextMenu.vue'
import { useLocalStorage } from '@vueuse/core'
import { useImageApi } from './composables/useImageApi'
import { CanvasImage, ImageUrl } from './types/image.type'
import { useContextMenu } from './composables/useContextMenu'
import { MenuItem } from './components/ContextMenu.vue'
import { useKeyboard } from './composables/useKeyboard'
import { useDragAndDrop } from './composables/useDragAndDrop'

const KEY_CANVAS_IMAGES = 'CANVAS_IMAGES'

const currentYear = new Date().getFullYear()

const selectedIndex = ref<number | null>(null)

const { images, fetchImages, loading, error } = useImageApi()

onMounted(() => {
  fetchImages()
})

const {
  visible: contextVisible,
  position: contextPosition,
  target: contextTarget,
  show: showContextMenu,
  hide: hideContextMenu,
} = useContextMenu<number>()

const deleteImage = (index: number) => {
  canvasImage.value.splice(index, 1)
  if (selectedIndex.value === index) {
    selectedIndex.value = null
  } else if (selectedIndex.value !== null && selectedIndex.value > index) {
    selectedIndex.value--
  }
}

const actions: MenuItem[] = [
  {
    icon: '❌', // Just use simple icons to save time
    label: 'Delete',
    action: () => {
      if (contextTarget.value !== null) deleteImage(contextTarget.value)
      hideContextMenu()
    },
  },
  {
    icon: '📄',
    label: 'Duplicate',
    action: () => {
      if (contextTarget.value !== null) duplicateImage(contextTarget.value)
      hideContextMenu()
    },
  },
  {
    icon: '⬆️',
    label: 'Bring to front',
    action: () => {
      if (contextTarget.value !== null) bringImageToFront(contextTarget.value)
      hideContextMenu()
    },
  },
]

const canvasImage = useLocalStorage<CanvasImage[]>(KEY_CANVAS_IMAGES, [], {
  // Compress the storage to store a large number of images
  serializer: {
    read: (value: string) => {
      try {
        return JSON.parse(decodeURIComponent(atob(value)))
      } catch {
        return []
      }
    },
    write: (value: CanvasImage[]) => {
      return btoa(encodeURIComponent(JSON.stringify(value)))
    },
  },
})

const canvas = ref<HTMLElement | null>(null)

const { onDragStart, onDrop, startDragging, clearSelection } = useDragAndDrop(
  canvasImage,
  canvas,
  selectedIndex
)

useKeyboard(canvasImage, selectedIndex, deleteImage)

const onUploaded = (url: ImageUrl) => {
  images.value.push(url)
}

const duplicateImage = (index: number) => {
  const targetImage = canvasImage.value[index]
  const newIndex = index + 1
  const newOffset = 10
  canvasImage.value.splice(newIndex, 0, {
    ...targetImage,
    x: targetImage.x + newOffset,
    y: targetImage.y + newOffset,
  })
  selectedIndex.value = newIndex
}

const maxZIndex = computed(() =>
  Math.max(...canvasImage.value.map(img => img.z).filter(z => z !== undefined))
)

const bringImageToFront = (index: number) => {
  const targetImage = canvasImage.value[index]
  targetImage.z = maxZIndex.value + 1
}

const getCanvasImageStyle = (image: CanvasImage) => {
  return { left: image.x + 'px', top: image.y + 'px', zIndex: image.z ?? 0 }
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
  overflow: auto;
}

.canvas {
  width: 800px;
  height: 600px;
  background-color: var(--color-white);
  box-shadow: 0.125rem 0 1rem var(--color-box-shadow);
  position: relative;
  margin: 2rem;
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

.footer {
  grid-area: footer;
  text-align: center;
  padding: 2rem;
  background-color: var(--color-footer);
  color: var(--color-white);
}
</style>
