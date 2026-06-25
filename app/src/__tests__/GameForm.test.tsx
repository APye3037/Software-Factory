import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import GameForm from '../components/GameForm'
import type { GameType, Manufacturer } from '../types'

const gameTypes: GameType[] = [
  { id: 1, name: 'Strategy' },
  { id: 2, name: 'Party' },
]

const manufacturers: Manufacturer[] = [
  { id: 1, name: 'Acme Games' },
  { id: 2, name: 'Fun Corp' },
]

function renderForm(overrides: Partial<Parameters<typeof GameForm>[0]> = {}) {
  const onSave = vi.fn().mockResolvedValue(undefined)
  const onCancel = vi.fn()
  render(
    <GameForm
      gameTypes={gameTypes}
      manufacturers={manufacturers}
      onSave={onSave}
      onCancel={onCancel}
      {...overrides}
    />
  )
  return { onSave, onCancel }
}

describe('GameForm', () => {
  it('renders all fields', () => {
    renderForm()
    expect(screen.getByLabelText(/game name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/number of players/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/game type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/manufacturer/i)).toBeInTheDocument()
  })

  it('shows error when name is empty on submit', async () => {
    const user = userEvent.setup()
    const { onSave } = renderForm()
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/game name is required/i)).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('shows error when num_players is 0', async () => {
    const user = userEvent.setup()
    const { onSave } = renderForm()
    await user.type(screen.getByLabelText(/game name/i), 'My Game')
    await user.clear(screen.getByLabelText(/number of players/i))
    await user.type(screen.getByLabelText(/number of players/i), '0')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/whole number/i)).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('calls onSave with valid data', async () => {
    const user = userEvent.setup()
    const { onSave } = renderForm()
    await user.type(screen.getByLabelText(/game name/i), 'Catan')
    await user.clear(screen.getByLabelText(/number of players/i))
    await user.type(screen.getByLabelText(/number of players/i), '4')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      name: 'Catan',
      num_players: 4,
      game_type_id: 1,
      manufacturer_id: 1,
    }))
  })

  it('shows duplicate name error on API 409', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockRejectedValue(new Error('already exists'))
    render(
      <GameForm
        gameTypes={gameTypes}
        manufacturers={manufacturers}
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )
    await user.type(screen.getByLabelText(/game name/i), 'Catan')
    await user.clear(screen.getByLabelText(/number of players/i))
    await user.type(screen.getByLabelText(/number of players/i), '4')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/a game with that name already exists/i)).toBeInTheDocument()
  })
})
