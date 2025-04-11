import { ref } from 'vue'
import { ImageUrl, UploadedImage } from '../types/image.type'

const BASE_URL = 'http://localhost:8000'

export function useImageApi() {
  const images = ref<ImageUrl[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchImages = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${BASE_URL}/images`)
      if (!res.ok) console.error('Failed to fetch images')
      images.value = await res.json()
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('upload', file)

    try {
      const res = await fetch(`${BASE_URL}/uploads`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) console.error('Upload failed')
      const data: UploadedImage = await res.json()
      return data.file
    } catch (err) {
      console.error('Upload error:', err)
      return null
    }
  }

  return {
    images,
    loading,
    error,
    fetchImages,
    uploadImage,
  }
}
