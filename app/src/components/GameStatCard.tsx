import type { GameStats } from '../types'

interface Props {
  stats: GameStats
}

export default function GameStatCard({ stats }: Props) {
  if (stats.times_played === 0) {
    return (
      <div className="card">
        <h2>{stats.game_name}</h2>
        <p style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)' }}>No sessions recorded yet</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>{stats.game_name}</h2>
      <p style={{ marginTop: '0.5rem', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
        Times played: <strong>{stats.times_played}</strong>
      </p>
      <h3>Winners</h3>
      <table style={{ marginTop: '0.5rem' }}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Wins</th>
          </tr>
        </thead>
        <tbody>
          {stats.winners.map((w, i) => (
            <tr key={w.player_id}>
              <td>{i + 1}</td>
              <td>{w.player_name}</td>
              <td>{w.wins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
