import { useState } from 'react'
import { usePlayers } from '../hooks/usePlayers'
import { usePlayerStats } from '../hooks/usePlayerStats'
import PlayerStatCard from '../components/PlayerStatCard'

export default function PlayerStatsPage() {
  const { players, loading: playersLoading } = usePlayers()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { stats, loading: statsLoading, error: statsError } = usePlayerStats(selectedId)

  return (
    <div>
      <div className="page-header">
        <h1>Player Stats</h1>
      </div>

      <div className="form-group" style={{ maxWidth: '320px', marginBottom: '1.5rem' }}>
        <label htmlFor="player-stats-select">Select a player</label>
        <select
          id="player-stats-select"
          value={selectedId ?? ''}
          onChange={e => setSelectedId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">-- Select a player --</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {playersLoading && <p className="loading-msg">Loading players...</p>}
      {statsLoading && <p className="loading-msg">Loading stats...</p>}
      {statsError && <p className="error-msg">{statsError}</p>}
      {stats && !statsLoading && <PlayerStatCard stats={stats} />}
    </div>
  )
}
