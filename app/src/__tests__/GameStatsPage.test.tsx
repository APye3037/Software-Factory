import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import GameStatsPage from '../pages/GameStatsPage'

vi.mock('../api/games', () => ({
  fetchGames: vi.fn().mockResolvedValue([
    { id: 1, name: 'Catan', num_players: 4, game_type_id: 1, game_type_name: 'Strategy', manufacturer_id: 1, manufacturer_name: 'Kosmos', created_at: '2024-01-01' },
    { id: 2, name: 'Pandemic', num_players: 4, game_type_id: 1, game_type_name: 'Coop', manufacturer_id: 2, manufacturer_name: 'ZMan', created_at: '2024-01-01' },
  ]),
}))

vi.mock('../api/stats', () => ({
  fetchGameStats: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) {
      return {
        game_id: 1,
        game_name: 'Catan',
        times_played: 3,
        winners: [
          { player_id: 1, player_name: 'Alice', wins: 2 },
          { player_id: 2, player_name: 'Bob', wins: 1 },
        ],
      }
    }
    if (id === 2) {
      return {
        game_id: 2,
        game_name: 'Pandemic',
        times_played: 0,
        winners: [],
      }
    }
  }),
}))

describe('GameStatsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows no stats when no game is selected', async () => {
    render(<GameStatsPage />)
    await waitFor(() => expect(screen.getByText('Catan')).toBeInTheDocument())
    expect(screen.queryByText(/times played/i)).not.toBeInTheDocument()
  })

  it('displays times_played and winners when game selected', async () => {
    const user = userEvent.setup()
    render(<GameStatsPage />)
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument())
    await user.selectOptions(screen.getByRole('combobox'), '1')
    expect(await screen.findByText('Alice')).toBeInTheDocument()
    expect(await screen.findByText('Bob')).toBeInTheDocument()
    expect(await screen.findByText('3')).toBeInTheDocument()
  })

  it('shows "No sessions recorded yet" when times_played is 0', async () => {
    const user = userEvent.setup()
    render(<GameStatsPage />)
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument())
    await user.selectOptions(screen.getByRole('combobox'), '2')
    expect(await screen.findByText(/no sessions recorded yet/i)).toBeInTheDocument()
  })

  it('renders winners in the order returned (by wins descending per API)', async () => {
    const user = userEvent.setup()
    render(<GameStatsPage />)
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument())
    await user.selectOptions(screen.getByRole('combobox'), '1')
    await screen.findByText('Alice')
    const rows = screen.getAllByRole('row')
    // header row + 2 data rows
    const dataRows = rows.slice(1)
    expect(dataRows[0]).toHaveTextContent('Alice')
    expect(dataRows[1]).toHaveTextContent('Bob')
  })
})
