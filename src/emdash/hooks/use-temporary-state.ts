import { useCallback, useEffect, useRef, useState } from 'react'

export function useTemporaryState<T>(
  initialState: T,
  duration = 3000,
) {
  const [state, setState] = useState(initialState)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearState = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setState(initialState)
  }, [initialState])

  const setTemporaryState = useCallback(
    (value: React.SetStateAction<T>, nextDuration = duration) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setState(value)

      if (nextDuration <= 0) {
        timeoutRef.current = null
        return
      }

      timeoutRef.current = setTimeout(() => {
        setState(initialState)
        timeoutRef.current = null
      }, nextDuration)
    },
    [duration, initialState],
  )

  useEffect(() => clearState, [clearState])

  return [state, setTemporaryState, clearState] as const
}
