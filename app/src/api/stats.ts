import { apiFetch } from './client'
import type { GameStats, PlayerStats } from '../types'

export async function fetchGameStats(id: number): Promise<GameStats> {
  return apiFetch(`/api/stats/games/${id}`) as Promise<GameStats>
}

export async function fetchPlayerStats(id: number): Promise<PlayerStats> {
  return apiFetch(`/api/stats/players/${id}`) as Promise<PlayerStats>
}
