import { describe, it, expect, vi } from 'vitest'
import { useThrottle } from '../useThrottle'

describe('useThrottle', () => {
  it('calls function immediately on first call', () => {
    const fn = vi.fn()
    const throttled = useThrottle(fn, 100)

    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('does not call function again within throttle limit', () => {
    const fn = vi.fn()
    const throttled = useThrottle(fn, 100)

    throttled()
    throttled()
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('calls function again after throttle limit', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = useThrottle(fn, 100)

    throttled()
    expect(fn).toHaveBeenCalledTimes(1)

    // Fast forward 50ms, still within throttle
    vi.advanceTimersByTime(50)
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)

    // Fast forward 100ms total, now it's allowed
    vi.advanceTimersByTime(50)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)

    vi.useRealTimers()
  })
})
