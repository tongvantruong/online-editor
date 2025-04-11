import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useImageApi } from '../useImageApi'
import { flushPromises } from '@vue/test-utils'

describe('useImageApi', () => {
  const mockImages = ['http://localhost:8000/images/1.png']
  const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' })

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('"fetchImages" loads images and updates state', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockImages,
    } as Response)

    const { fetchImages, images, loading, error } = useImageApi()

    expect(images.value).toEqual([])
    await fetchImages()
    await flushPromises()

    expect(images.value).toEqual(mockImages)
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it('"fetchImages" handles fetch error', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

    const { fetchImages, error } = useImageApi()

    await fetchImages()
    await flushPromises()

    expect(error.value).toBe('Network error')
  })

  it('"uploadImage" sends file and returns uploaded URL', async () => {
    const mockResponse = { file: 'http://localhost:8000/images/test.png' }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const { uploadImage } = useImageApi()
    const result = await uploadImage(mockFile)

    expect(result).toBe(mockResponse.file)
  })

  it('"uploadImage" handles upload failure', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Upload failed'))

    const { uploadImage } = useImageApi()
    const result = await uploadImage(mockFile)

    expect(result).toBe(null)
  })
})
