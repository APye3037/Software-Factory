import { apiFetch } from './client'
import type { Player } from '../types'

export async function fetchPlayers(): Promise<Player[]> {
  return apiFetch('/api/players') as Promise<Player[]>
}

export async function createPlayer(name: string): Promise<Player> {
  return apiFetch('/api/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }) as Promise<Player>
}

export async function updatePlayer(id: number, name: string): Promise<Player> {
  return apiFetch(`/api/players/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }) as Promise<Player>
}

export async function deletePlayer(id: number): Promise<void> {
  await apiFetch(`/api/players/${id}`, { method: 'DELETE' })
}
