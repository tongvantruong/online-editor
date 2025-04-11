<template>
  <div
    class="upload-area"
    @click="openFileDialog"
    @dragover.prevent="isDraggingOver = true"
    @dragleave="isDraggingOver = false"
    @drop.prevent="handleDrop"
    :class="{ 'drag-over': isDraggingOver }"
  >
    <span>📁 Upload Images</span>
    <p class="description">You can drop your images here</p>
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const fileInput = ref<HTMLInputElement | null>(null)
const isDraggingOver = ref(false)

const emit = defineEmits<{
  uploaded: [url: string]
}>()

const openFileDialog = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files) return
  handleFiles(Array.from(target.files))
  target.value = ''
}

const handleDrop = (e: DragEvent) => {
  isDraggingOver.value = false
  const files = e.dataTransfer?.files
  if (files) {
    handleFiles(Array.from(files))
  }
}

const handleFiles = (files: File[]) => {
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      uploadImage(file).then(url => {
        emit('uploaded', url)
      })
    }
  })
}

const uploadImage = async (file: File) => {
  const formData = new FormData()
  formData.append('upload', file)

  try {
    const res = await fetch('http://localhost:8000/uploads', {
      method: 'POST',
      body: formData,
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message)
    return result.file
  } catch (err) {
    console.error('Upload failed:', err)
  }
}
</script>

<style scoped>
.upload-area {
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  background: var(--color-bg-white);
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  cursor: pointer;
  position: relative;
}

.upload-area:hover {
  background: var(--color-bg-grey);
}

.description {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}

.upload-area.drag-over {
  background: var(--color-bg-primary);
  border-color: var(--color-primary);
  color: var(--color-primary);
  .description {
    color: var(--color-primary);
  }
}

.upload-area span {
  pointer-events: none;
}

input[type='file'].hidden {
  display: none;
}
</style>
