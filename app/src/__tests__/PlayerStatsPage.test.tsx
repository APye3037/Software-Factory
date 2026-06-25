import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PlayerStatsPage from '../pages/PlayerStatsPage'

vi.mock('../api/players', () => ({
  fetchPlayers: vi.fn().mockResolvedValue([
    { id: 1, name: 'Alice', created_at: '2024-01-01' },
    { id: 2, name: 'Bob', created_at: '2024-01-01' },
  ]),
}))

vi.mock('../api/stats', () => ({
  fetchPlayerStats: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) {
      return {
        player_id: 1,
        player_name: 'Alice',
        total_sessions: 5,
        most_played_game: { game_id: 1, game_name: 'Catan', count: 3 },
        wins: { this_week: 1, this_month: 2, this_year: 4, all_time: 7 },
      }
    }
    if (id === 2) {
      return {
        player_id: 2,
        player_name: 'Bob',
        total_sessions: 0,
        most_played_game: null,
        wins: { this_week: 0, this_month: 0, this_year: 0, all_time: 0 },
      }
    }
  }),
}))

describe('PlayerStatsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows no stats when no player is selected', async () => {
    render(<PlayerStatsPage />)
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
    expect(screen.queryByText(/total sessions/i)).not.toBeInTheDocument()
  })

  it('displays correct stats when player is selected', async () => {
    const user = userEvent.setup()
    render(<PlayerStatsPage />)
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument())
    await user.selectOptions(screen.getByRole('combobox'), '1')
    expect(await screen.findByText(/5/)).toBeInTheDocument()
    expect(await screen.findByText(/catan/i)).toBeInTheDocument()
  })

  it('shows dash when most_played_game is null', async () => {
    const user = userEvent.setup()
    render(<PlayerStatsPage />)
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument())
    await user.selectOptions(screen.getByRole('combobox'), '2')
    expect(await screen.findByText('—')).toBeInTheDocument()
  })

  it('shows zero wins without errors', async () => {
    const user = userEvent.setup()
    render(<PlayerStatsPage />)
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument())
    await user.selectOptions(screen.getByRole('combobox'), '2')
    await screen.findByText('—')
    // All win cells should be 0
    const cells = screen.getAllByRole('cell')
    const winCells = cells.filter(c => c.textContent === '0')
    expect(winCells.length).toBeGreaterThanOrEqual(4)
  })
})
