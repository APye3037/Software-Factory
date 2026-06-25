import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import PlayerForm from '../components/PlayerForm'

describe('PlayerForm', () => {
  it('shows error when name is empty on submit', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<PlayerForm onSave={onSave} onCancel={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/player name is required/i)).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('calls onSave with valid name', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<PlayerForm onSave={onSave} onCancel={vi.fn()} />)
    await user.type(screen.getByLabelText(/player name/i), 'Alice')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSave).toHaveBeenCalledWith('Alice'))
  })

  it('shows duplicate error on 409', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockRejectedValue(new Error('already exists'))
    render(<PlayerForm onSave={onSave} onCancel={vi.fn()} />)
    await user.type(screen.getByLabelText(/player name/i), 'Alice')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/a player with that name already exists/i)).toBeInTheDocument()
  })
})
