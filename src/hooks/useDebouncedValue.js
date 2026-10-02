import { useEffect, useState } from 'react'

export default function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timeoutId) // cleanup cancels the old timer
  }, [value, delay])

  return debounced
}
