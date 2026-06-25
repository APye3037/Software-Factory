import { useState, useEffect, useCallback } from 'react'
import type { GameType } from '../types'
import { fetchGameTypes } from '../api/gameTypes'

export function useGameTypes() {
  const [gameTypes, setGameTypes] = useState<GameType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchGameTypes()
      setGameTypes(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { gameTypes, loading, error, refresh: load }
}
