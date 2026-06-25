import { useState } from 'react'
import type { Game, GameType, Manufacturer } from '../types'
import type { GamePayload } from '../api/games'
import './GameForm.css'

interface Props {
  game?: Game
  gameTypes: GameType[]
  manufacturers: Manufacturer[]
  onSave: (data: GamePayload) => Promise<void>
  onCancel: () => void
}

export default function GameForm({ game, gameTypes, manufacturers, onSave, onCancel }: Props) {
  const [name, setName] = useState(game?.name ?? '')
  const [numPlayers, setNumPlayers] = useState(game ? String(game.num_players) : '')
  const [gameTypeId, setGameTypeId] = useState(game ? String(game.game_type_id) : (gameTypes[0] ? String(gameTypes[0].id) : ''))
  const [manufacturerId, setManufacturerId] = useState(game ? String(game.manufacturer_id) : (manufacturers[0] ? String(manufacturers[0].id) : ''))
  const [nameError, setNameError] = useState<string | null>(null)
  const [numPlayersError, setNumPlayersError] = useState<string | null>(null)
  const [gameTypeError, setGameTypeError] = useState<string | null>(null)
  const [manufacturerError, setManufacturerError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setNameError(null)
    setNumPlayersError(null)
    setGameTypeError(null)
    setManufacturerError(null)
    setApiError(null)

    let valid = true

    if (!name.trim()) {
      setNameError('Game name is required')
      valid = false
    }

    const numVal = Number(numPlayers)
    if (!numPlayers.trim()) {
      setNumPlayersError('Number of players is required')
      valid = false
    } else if (!Number.isInteger(numVal) || numVal < 1) {
      setNumPlayersError('Must be a whole number of at least 1')
      valid = false
    }

    if (!gameTypeId) {
      setGameTypeError('Please select a game type. Add one under Lookups first if the list is empty.')
      valid = false
    }

    if (!manufacturerId) {
      setManufacturerError('Please select a manufacturer. Add one under Lookups first if the list is empty.')
      valid = false
    }

    if (!valid) return

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        num_players: numVal,
        game_type_id: Number(gameTypeId),
        manufacturer_id: Number(manufacturerId),
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save'
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
        setApiError('A game with that name already exists.')
      } else {
        setApiError(msg)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="game-form" onSubmit={handleSubmit} noValidate>
      <h2>{game ? 'Edit Game' : 'Add Game'}</h2>

      <div className="form-group">
        <label htmlFor="game-name">Game Name</label>
        <input
          id="game-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        {nameError && <p className="error-msg">{nameError}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="game-num-players">Number of Players</label>
        <input
          id="game-num-players"
          type="number"
          value={numPlayers}
          onChange={e => setNumPlayers(e.target.value)}
          min={1}
          step={1}
          required
        />
        {numPlayersError && <p className="error-msg">{numPlayersError}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="game-type">Game Type</label>
        {gameTypes.length === 0
          ? <p className="error-msg">No game types found — go to <a href="/lookups">Lookups</a> to add one first.</p>
          : <select
              id="game-type"
              value={gameTypeId}
              onChange={e => setGameTypeId(e.target.value)}
            >
              {gameTypes.map(gt => (
                <option key={gt.id} value={gt.id}>{gt.name}</option>
              ))}
            </select>
        }
        {gameTypeError && <p className="error-msg">{gameTypeError}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="game-manufacturer">Manufacturer</label>
        {manufacturers.length === 0
          ? <p className="error-msg">No manufacturers found — go to <a href="/lookups">Lookups</a> to add one first.</p>
          : <select
              id="game-manufacturer"
              value={manufacturerId}
              onChange={e => setManufacturerId(e.target.value)}
            >
              {manufacturers.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
        }
        {manufacturerError && <p className="error-msg">{manufacturerError}</p>}
      </div>

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
