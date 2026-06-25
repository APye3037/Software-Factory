import { apiFetch } from './client'
import type { GameType } from '../types'

export async function fetchGameTypes(): Promise<GameType[]> {
  return apiFetch('/api/game-types') as Promise<GameType[]>
}

export async function createGameType(name: string): Promise<GameType> {
  return apiFetch('/api/game-types', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }) as Promise<GameType>
}

export async function updateGameType(id: number, name: string): Promise<GameType> {
  return apiFetch(`/api/game-types/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }) as Promise<GameType>
}

export async function deleteGameType(id: number): Promise<void> {
  await apiFetch(`/api/game-types/${id}`, { method: 'DELETE' })
}
