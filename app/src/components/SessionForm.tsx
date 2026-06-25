import { useState } from 'react'
import type { Session, Game, Player } from '../types'
import type { SessionPayload } from '../api/sessions'
import './SessionForm.css'

interface Props {
  session?: Session
  games: Game[]
  players: Player[]
  onSave: (data: SessionPayload) => Promise<{ warning?: string }>
  onCancel: () => void
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function SessionForm({ session, games, players, onSave, onCancel }: Props) {
  const today = todayString()

  const [playedOn, setPlayedOn] = useState(session?.played_on ?? today)
  const [gameId, setGameId] = useState(session ? String(session.game_id) : (games[0] ? String(games[0].id) : ''))
  const [checkedPlayerIds, setCheckedPlayerIds] = useState<Set<number>>(
    () => new Set(session?.players.map(p => p.player_id) ?? [])
  )
  const [winnerId, setWinnerId] = useState(session ? String(session.winner_id) : '')

  const [playedOnError, setPlayedOnError] = useState<string | null>(null)
  const [gameError, setGameError] = useState<string | null>(null)
  const [playersError, setPlayersError] = useState<string | null>(null)
  const [winnerError, setWinnerError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const checkedPlayers = players.filter(p => checkedPlayerIds.has(p.id))

  function togglePlayer(id: number, checked: boolean) {
    setCheckedPlayerIds(prev => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
        // If the unchecked player was the winner, reset winner
        if (winnerId === String(id)) {
          setWinnerId('')
        }
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPlayedOnError(null)
    setGameError(null)
    setPlayersError(null)
    setWinnerError(null)
    setApiError(null)
    setWarning(null)

    let valid = true

    if (!playedOn) {
      setPlayedOnError('Date is required')
      valid = false
    }

    if (!gameId) {
      setGameError('Game is required')
      valid = false
    }

    if (checkedPlayerIds.size === 0) {
      setPlayersError('At least one player must be selected')
      valid = false
    }

    if (!winnerId) {
      setWinnerError('Winner is required')
      valid = false
    }

    if (!valid) return

    setSaving(true)
    try {
      const result = await onSave({
        played_on: playedOn,
        game_id: Number(gameId),
        player_ids: Array.from(checkedPlayerIds),
        winner_id: Number(winnerId),
      })
      if (result?.warning) {
        setWarning(result.warning)
      }
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="session-form" onSubmit={handleSubmit} noValidate>
      <h2>{session ? 'Edit Session' : 'Add Session'}</h2>

      <div className="form-group">
        <label htmlFor="session-date">Date</label>
        <input
          id="session-date"
          type="date"
          value={playedOn}
          max={today}
          onChange={e => setPlayedOn(e.target.value)}
          required
        />
        {playedOnError && <p className="error-msg">{playedOnError}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="session-game">Game</label>
        <select
          id="session-game"
          value={gameId}
          onChange={e => setGameId(e.target.value)}
        >
          {!gameId && <option value="">Select a game</option>}
          {games.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        {gameError && <p className="error-msg">{gameError}</p>}
      </div>

      <div className="form-group">
        <label>Players</label>
        <ul className="players-checkbox-list">
          {players.map(p => (
            <li key={p.id}>
              <input
                type="checkbox"
                id={`player-check-${p.id}`}
                checked={checkedPlayerIds.has(p.id)}
                onChange={e => togglePlayer(p.id, e.target.checked)}
              />
              <label htmlFor={`player-check-${p.id}`}>{p.name}</label>
            </li>
          ))}
        </ul>
        {playersError && <p className="error-msg">{playersError}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="session-winner">Winner</label>
        <select
          id="session-winner"
          value={winnerId}
          onChange={e => setWinnerId(e.target.value)}
        >
          <option value="">Select winner</option>
          {checkedPlayers.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {winnerError && <p className="error-msg">{winnerError}</p>}
      </div>

      {warning && <div className="warning-banner">{warning}</div>}
      {apiError && <p className="form-api-error">{apiError}</p>}

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
