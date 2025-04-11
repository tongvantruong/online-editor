const THROTTLE_60_FPS = 16

export const useThrottle = <T extends (...args: any[]) => void>(
  fn: T,
  limit: number = THROTTLE_60_FPS
): T => {
  let lastCall = 0

  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= limit) {
      lastCall = now
      fn(...args)
    }
  }) as T
}
