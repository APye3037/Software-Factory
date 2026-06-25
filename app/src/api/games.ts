import { apiFetch } from './client'
import type { Game } from '../types'

export interface GamePayload {
  name: string
  num_players: number
  game_type_id: number
  manufacturer_id: number
}

export async function fetchGames(): Promise<Game[]> {
  return apiFetch('/api/games') as Promise<Game[]>
}

export async function createGame(data: GamePayload): Promise<Game> {
  return apiFetch('/api/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }) as Promise<Game>
}

export async function updateGame(id: number, data: GamePayload): Promise<Game> {
  return apiFetch(`/api/games/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }) as Promise<Game>
}

export async function deleteGame(id: number): Promise<void> {
  await apiFetch(`/api/games/${id}`, { method: 'DELETE' })
}
