import { useEffect, useState, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  hasMore: boolean
  isLoading: boolean
  threshold?: number // Distance from bottom to trigger load (in pixels)
}

export const useInfiniteScroll = (
  callback: () => void,
  options: UseInfiniteScrollOptions
) => {
  const { hasMore, isLoading, threshold = 200 } = options
  const [isFetching, setIsFetching] = useState(false)

  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore || isFetching) return

    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
    const clientHeight = document.documentElement.clientHeight || window.innerHeight

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      setIsFetching(true)
    }
  }, [hasMore, isLoading, isFetching, threshold])

  useEffect(() => {
    if (!isFetching) return

    callback()
    setIsFetching(false)
  }, [isFetching, callback])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return { isFetching }
}
