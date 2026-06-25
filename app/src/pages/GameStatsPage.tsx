import { useState } from 'react'
import { useGames } from '../hooks/useGames'
import { useGameStats } from '../hooks/useGameStats'
import GameStatCard from '../components/GameStatCard'

export default function GameStatsPage() {
  const { games, loading: gamesLoading } = useGames()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { stats, loading: statsLoading, error: statsError } = useGameStats(selectedId)

  return (
    <div>
      <div className="page-header">
        <h1>Game Stats</h1>
      </div>

      <div className="form-group" style={{ maxWidth: '320px', marginBottom: '1.5rem' }}>
        <label htmlFor="game-stats-select">Select a game</label>
        <select
          id="game-stats-select"
          value={selectedId ?? ''}
          onChange={e => setSelectedId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">-- Select a game --</option>
          {games.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {gamesLoading && <p className="loading-msg">Loading games...</p>}
      {statsLoading && <p className="loading-msg">Loading stats...</p>}
      {statsError && <p className="error-msg">{statsError}</p>}
      {stats && !statsLoading && <GameStatCard stats={stats} />}
    </div>
  )
}
