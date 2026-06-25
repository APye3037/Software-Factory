import type { PlayerStats } from '../types'

interface Props {
  stats: PlayerStats
}

export default function PlayerStatCard({ stats }: Props) {
  return (
    <div className="card">
      <h2>{stats.player_name}</h2>
      <p style={{ marginTop: '0.5rem', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
        Total sessions: <strong>{stats.total_sessions}</strong>
      </p>
      <p style={{ marginBottom: '1rem' }}>
        Most played game:{' '}
        <strong>
          {stats.most_played_game ? `${stats.most_played_game.game_name} (${stats.most_played_game.count}×)` : '—'}
        </strong>
      </p>
      <h3>Wins</h3>
      <table style={{ marginTop: '0.5rem' }}>
        <thead>
          <tr>
            <th>Period</th>
            <th>Wins</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>This Week</td>
            <td>{stats.wins.this_week}</td>
          </tr>
          <tr>
            <td>This Month</td>
            <td>{stats.wins.this_month}</td>
          </tr>
          <tr>
            <td>This Year</td>
            <td>{stats.wins.this_year}</td>
          </tr>
          <tr>
            <td>All Time</td>
            <td>{stats.wins.all_time}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
