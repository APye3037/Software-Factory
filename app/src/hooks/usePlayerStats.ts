import { useState, useEffect, useCallback } from 'react'
import type { PlayerStats } from '../types'
import { fetchPlayerStats } from '../api/stats'

export function usePlayerStats(id: number | null) {
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (playerId: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPlayerStats(playerId)
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
