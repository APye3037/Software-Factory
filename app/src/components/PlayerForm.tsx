import { useState } from 'react'
import type { Player } from '../types'

interface Props {
  player?: Player
  onSave: (name: string) => Promise<void>
  onCancel: () => void
}

export default function PlayerForm({ player, onSave, onCancel }: Props) {
  const [name, setName] = useState(player?.name ?? '')
  const [nameError, setNameError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setNameError(null)
    setApiError(null)

    if (!name.trim()) {
      setNameError('Player name is required')
      return
    }

    setSaving(true)
    try {
      await onSave(name.trim())
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save'
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
        setApiError('A player with that name already exists.')
      } else {
        setApiError(msg)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: '1.5rem', maxWidth: '400px' }}>
      <h2>{player ? 'Edit Player' : 'Add Player'}</h2>
      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label htmlFor="player-name">Player Name</label>
        <input
          id="player-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        {nameError && <p className="error-msg">{nameError}</p>}
      </div>
      {apiError && (
        <p className="error-msg" style={{ marginTop: '0.5rem' }}>{apiError}</p>
      )}
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  )
}
