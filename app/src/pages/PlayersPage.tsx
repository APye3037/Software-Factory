import { useState } from 'react'
import { usePlayers } from '../hooks/usePlayers'
import { createPlayer, updatePlayer, deletePlayer } from '../api/players'
import type { Player } from '../types'
import PlayerForm from '../components/PlayerForm'

export default function PlayersPage() {
  const { players, loading, error, refresh } = usePlayers()

  const [showForm, setShowForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [deleteErrors, setDeleteErrors] = useState<Record<number, string>>({})

  async function handleSave(name: string) {
    if (editingPlayer) {
      await updatePlayer(editingPlayer.id, name)
    } else {
      await createPlayer(name)
    }
    setShowForm(false)
    setEditingPlayer(null)
    await refresh()
  }

  async function handleDelete(id: number) {
    setDeleteErrors(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    try {
      await deletePlayer(id)
      await refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to delete'
      setDeleteErrors(prev => ({
        ...prev,
        [id]: msg.toLowerCase().includes('session') ? 'Cannot delete: player has participated in one or more sessions.' : msg,
      }))
    }
  }

  function startEdit(player: Player) {
    setEditingPlayer(player)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingPlayer(null)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Players</h1>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add Player
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ marginBottom: '1.5rem' }}>
          <PlayerForm
            player={editingPlayer ?? undefined}
            onSave={handleSave}
            onCancel={closeForm}
          />
        </div>
      )}

      {loading && <p className="loading-msg">Loading players...</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && players.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>No players yet. Add one above!</p>
      )}

      {players.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <>
                <tr key={player.id}>
                  <td>{player.name}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn-secondary btn-small" onClick={() => startEdit(player)}>
                        Edit
                      </button>
                      <button className="btn-danger btn-small" onClick={() => handleDelete(player.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {deleteErrors[player.id] && (
                  <tr key={`err-${player.id}`}>
                    <td colSpan={2}>
                      <span className="error-msg">{deleteErrors[player.id]}</span>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
