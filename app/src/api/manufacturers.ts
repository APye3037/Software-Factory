import { apiFetch } from './client'
import type { Manufacturer } from '../types'

export async function fetchManufacturers(): Promise<Manufacturer[]> {
  return apiFetch('/api/manufacturers') as Promise<Manufacturer[]>
}

export async function createManufacturer(name: string): Promise<Manufacturer> {
  return apiFetch('/api/manufacturers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }) as Promise<Manufacturer>
}

export async function updateManufacturer(id: number, name: string): Promise<Manufacturer> {
  return apiFetch(`/api/manufacturers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }) as Promise<Manufacturer>
}

export async function deleteManufacturer(id: number): Promise<void> {
  await apiFetch(`/api/manufacturers/${id}`, { method: 'DELETE' })
}
