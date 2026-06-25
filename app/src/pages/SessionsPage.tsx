import { useState } from 'react'
import { useSessions } from '../hooks/useSessions'
import { useGames } from '../hooks/useGames'
import { usePlayers } from '../hooks/usePlayers'
import { createSession, updateSession, deleteSession } from '../api/sessions'
import type { Session } from '../types'
import type { SessionPayload } from '../api/sessions'
import SessionForm from '../components/SessionForm'

export default function SessionsPage() {
  const { sessions, loading, error, refresh } = useSessions()
  const { games } = useGames()
  const { players } = usePlayers()

  const [showForm, setShowForm] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)

  async function handleSave(data: SessionPayload): Promise<{ warning?: string }> {
    let result: { warning?: string }
    if (editingSession) {
      result = await updateSession(editingSession.id, data)
    } else {
      result = await createSession(data)
    }
    if (!result?.warning) {
      setShowForm(false)
      setEditingSession(null)
    }
    await refresh()
    return result
  }

  async function handleDelete(id: number) {
    await deleteSession(id)
    await refresh()
  }

  function startEdit(session: Session) {
    setEditingSession(session)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingSession(null)
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString()
    } catch {
      return dateStr
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Sessions</h1>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add Session
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ marginBottom: '1.5rem' }}>
          <SessionForm
            session={editingSession ?? undefined}
            games={games}
            players={players}
            onSave={handleSave}
            onCancel={closeForm}
          />
        </div>
      )}

      {loading && <p className="loading-msg">Loading sessions...</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && sessions.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>No sessions yet. Add one above!</p>
      )}

      {sessions.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Game</th>
              <th>Winner</th>
              <th>Players</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(session => (
              <tr key={session.id}>
                <td>{formatDate(session.played_on)}</td>
                <td>{session.game_name}</td>
                <td>{session.winner_name}</td>
                <td>{session.players.map(p => p.player_name).join(', ')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn-secondary btn-small" onClick={() => startEdit(session)}>
                      Edit
                    </button>
                    <button className="btn-danger btn-small" onClick={() => handleDelete(session.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
