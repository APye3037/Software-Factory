import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import LookupTable from '../components/LookupTable'

const items = [
  { id: 1, name: 'Strategy' },
  { id: 2, name: 'Party' },
]

function renderTable(overrides: Partial<Parameters<typeof LookupTable>[0]> = {}) {
  const onAdd = vi.fn().mockResolvedValue(undefined)
  const onEdit = vi.fn().mockResolvedValue(undefined)
  const onDelete = vi.fn().mockResolvedValue(undefined)
  render(
    <LookupTable
      title="Game Types"
      items={items}
      loading={false}
      error={null}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      {...overrides}
    />
  )
  return { onAdd, onEdit, onDelete }
}

describe('LookupTable', () => {
  it('renders items list', () => {
    renderTable()
    expect(screen.getByText('Strategy')).toBeInTheDocument()
    expect(screen.getByText('Party')).toBeInTheDocument()
  })

  it('calls onAdd with name when add button clicked', async () => {
    const user = userEvent.setup()
    const { onAdd } = renderTable()
    const input = screen.getByRole('textbox', { name: /new game types name/i })
    await user.type(input, 'Abstract')
    await user.click(screen.getByRole('button', { name: /^add$/i }))
    await waitFor(() => expect(onAdd).toHaveBeenCalledWith('Abstract'))
  })

  it('calls onEdit when edit button clicked and saved', async () => {
    const user = userEvent.setup()
    const { onEdit } = renderTable()
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0])
    const input = screen.getByRole('textbox', { name: /edit name for/i })
    await user.clear(input)
    await user.type(input, 'Updated')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onEdit).toHaveBeenCalledWith(1, 'Updated'))
  })

  it('calls onDelete when delete button clicked', async () => {
    const user = userEvent.setup()
    const { onDelete } = renderTable()
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0])
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(1))
  })

  it('shows inline error when onDelete rejects', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn().mockRejectedValue(new Error('Cannot delete: item in use'))
    renderTable({ onDelete })
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0])
    expect(await screen.findByText(/cannot delete: item in use/i)).toBeInTheDocument()
  })
})
