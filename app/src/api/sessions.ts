import { apiFetch } from './client'
import type { Session } from '../types'

export interface SessionPayload {
  played_on: string
  game_id: number
  player_ids: number[]
  winner_id: number
}

export async function fetchSessions(): Promise<Session[]> {
  return apiFetch('/api/sessions') as Promise<Session[]>
}

export async function createSession(data: SessionPayload): Promise<Session> {
  return apiFetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }) as Promise<Session>
}

export async function updateSession(id: number, data: SessionPayload): Promise<Session> {
  return apiFetch(`/api/sessions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }) as Promise<Session>
}

export async function deleteSession(id: number): Promise<void> {
  await apiFetch(`/api/sessions/${id}`, { method: 'DELETE' })
}
