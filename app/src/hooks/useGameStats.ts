import { useState, useEffect, useCallback } from 'react'
import type { GameStats } from '../types'
import { fetchGameStats } from '../api/stats'

export function useGameStats(id: number | null) {
  const [stats, setStats] = useState<GameStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (gameId: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchGameStats(gameId)
      setStats(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id === null) {
      setStats(null)
      setError(null)
      return
    }
    load(id)
  }, [id, load])

  return { stats, loading, error }
}
