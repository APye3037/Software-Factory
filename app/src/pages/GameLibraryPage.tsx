import { useState } from 'react'
import { useGames } from '../hooks/useGames'
import { useGameTypes } from '../hooks/useGameTypes'
import { useManufacturers } from '../hooks/useManufacturers'
import { createGame, updateGame, deleteGame } from '../api/games'
import type { Game } from '../types'
import type { GamePayload } from '../api/games'
import GameForm from '../components/GameForm'

export default function GameLibraryPage() {
  const { games, loading, error, refresh } = useGames()
  const { gameTypes } = useGameTypes()
  const { manufacturers } = useManufacturers()

  const [showForm, setShowForm] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [deleteErrors, setDeleteErrors] = useState<Record<number, string>>({})

  async function handleSave(data: GamePayload) {
    if (editingGame) {
      await updateGame(editingGame.id, data)
    } else {
      await createGame(data)
    }
    setShowForm(false)
    setEditingGame(null)
    await refresh()
  }

  async function handleDelete(id: number) {
    setDeleteErrors(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    try {
      await deleteGame(id)
      await refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to delete'
      setDeleteErrors(prev => ({
        ...prev,
        [id]: msg.toLowerCase().includes('session') ? 'Cannot delete: game has existing sessions.' : msg,
      }))
    }
  }

  function startEdit(game: Game) {
    setEditingGame(game)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingGame(null)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Game Library</h1>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add Game
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ marginBottom: '1.5rem' }}>
          <GameForm
            game={editingGame ?? undefined}
            gameTypes={gameTypes}
            manufacturers={manufacturers}
            onSave={handleSave}
            onCancel={closeForm}
          />
        </div>
      )}

      {loading && <p className="loading-msg">Loading games...</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && games.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>No games yet. Add one above!</p>
      )}

      {games.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Players</th>
              <th>Type</th>
              <th>Manufacturer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <>
                <tr key={game.id}>
                  <td>{game.name}</td>
                  <td>{game.num_players}</td>
                  <td>{game.game_type_name}</td>
                  <td>{game.manufacturer_name}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn-secondary btn-small" onClick={() => startEdit(game)}>
                        Edit
                      </button>
                      <button className="btn-danger btn-small" onClick={() => handleDelete(game.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {deleteErrors[game.id] && (
                  <tr key={`err-${game.id}`}>
                    <td colSpan={5}>
                      <span className="error-msg">{deleteErrors[game.id]}</span>
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
