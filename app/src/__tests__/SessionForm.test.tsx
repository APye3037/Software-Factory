import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import SessionForm from '../components/SessionForm'
import type { Game, Player } from '../types'

const games: Game[] = [
  { id: 1, name: 'Catan', num_players: 4, game_type_id: 1, game_type_name: 'Strategy', manufacturer_id: 1, manufacturer_name: 'Kosmos', created_at: '2024-01-01' },
]

const players: Player[] = [
  { id: 1, name: 'Alice', created_at: '2024-01-01' },
  { id: 2, name: 'Bob', created_at: '2024-01-01' },
  { id: 3, name: 'Carol', created_at: '2024-01-01' },
]

function renderForm(overrides: Partial<Parameters<typeof SessionForm>[0]> = {}) {
  const onSave = vi.fn().mockResolvedValue({})
  const onCancel = vi.fn()
  render(
    <SessionForm
      games={games}
      players={players}
      onSave={onSave}
      onCancel={onCancel}
      {...overrides}
    />
  )
  return { onSave, onCancel }
}

describe('SessionForm', () => {
  it('date defaults to today', () => {
    renderForm()
    const today = new Date().toISOString().slice(0, 10)
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
    expect(dateInput.value).toBe(today)
  })

  it('max attribute on date input is today', () => {
    renderForm()
    const today = new Date().toISOString().slice(0, 10)
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
    expect(dateInput.max).toBe(today)
  })

  it('winner dropdown only includes checked players', async () => {
    const user = userEvent.setup()
    renderForm()
    // Initially no players checked — winner dropdown should be empty (only placeholder)
    const winnerSelect = screen.getByLabelText(/winner/i)
    expect(within(winnerSelect).queryByText('Alice')).not.toBeInTheDocument()

    // Check Alice
    await user.click(screen.getByLabelText('Alice'))
    expect(within(winnerSelect).getByText('Alice')).toBeInTheDocument()
    expect(within(winnerSelect).queryByText('Bob')).not.toBeInTheDocument()
  })

  it('unchecking current winner resets winner field', async () => {
    const user = userEvent.setup()
    renderForm()
    // Check Alice and Bob
    await user.click(screen.getByLabelText('Alice'))
    await user.click(screen.getByLabelText('Bob'))
    // Select Alice as winner
    await user.selectOptions(screen.getByLabelText(/winner/i), '1')
    // Uncheck Alice
    await user.click(screen.getByLabelText('Alice'))
    const winnerSelect = screen.getByLabelText(/winner/i) as HTMLSelectElement
    expect(winnerSelect.value).toBe('')
  })

  it('shows validation error when no players checked', async () => {
    const user = userEvent.setup()
    const { onSave } = renderForm()
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/at least one player/i)).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('shows validation error when no winner selected', async () => {
    const user = userEvent.setup()
    const { onSave } = renderForm()
    await user.click(screen.getByLabelText('Alice'))
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/winner is required/i)).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('displays warning banner when API response includes warning', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue({ warning: 'Winner was not in the player list!' })
    render(<SessionForm games={games} players={players} onSave={onSave} onCancel={vi.fn()} />)
    await user.click(screen.getByLabelText('Alice'))
    await user.selectOptions(screen.getByLabelText(/winner/i), '1')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/winner was not in the player list/i)).toBeInTheDocument()
  })

  it('validates that future date is blocked by max attribute', () => {
    renderForm()
    const today = new Date().toISOString().slice(0, 10)
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
    expect(dateInput.max).toBe(today)
  })
})
