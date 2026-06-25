import { useState, useEffect, useCallback } from 'react'
import type { Manufacturer } from '../types'
import { fetchManufacturers } from '../api/manufacturers'

export function useManufacturers() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchManufacturers()
      setManufacturers(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { manufacturers, loading, error, refresh: load }
}
