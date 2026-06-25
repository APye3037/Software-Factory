import { useState } from 'react'
import './LookupTable.css'

interface Props {
  title: string
  items: { id: number; name: string }[]
  loading: boolean
  error: string | null
  onAdd: (name: string) => Promise<void>
  onEdit: (id: number, name: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export default function LookupTable({ title, items, loading, error, onAdd, onEdit, onDelete }: Props) {
  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteErrors, setDeleteErrors] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    const trimmed = newName.trim()
    if (!trimmed) {
      setAddError('Name is required')
      return
    }
    setSaving(true)
    setAddError(null)
    try {
      await onAdd(trimmed)
      setNewName('')
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Failed to add')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(item: { id: number; name: string }) {
    setEditingId(item.id)
    setEditName(item.name)
    setDeleteErrors(prev => {
      const next = { ...prev }
      delete next[item.id]
      return next
    })
  }

  async function handleEditSave(id: number) {
    const trimmed = editName.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      await onEdit(id, trimmed)
      setEditingId(null)
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeleteErrors(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    try {
      await onDelete(id)
    } catch (e) {
      setDeleteErrors(prev => ({
        ...prev,
        [id]: e instanceof Error ? e.message : 'Failed to delete',
      }))
    }
  }

  return (
    <div className="lookup-table-container">
      <h2>{title}</h2>
      <div className="lookup-add-form">
        <input
          type="text"
          placeholder={`New ${title.toLowerCase()} name`}
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          aria-label={`New ${title} name`}
        />
        <button className="btn-primary btn-small" onClick={handleAdd} disabled={saving}>
          Add
        </button>
      </div>
      {addError && <p className="error-msg">{addError}</p>}
      {loading && <p className="loading-msg">Loading...</p>}
      {error && <p className="error-msg">{error}</p>}
      <ul className="lookup-list">
        {items.map(item => (
          <li key={item.id}>
            <div className="lookup-item">
              {editingId === item.id ? (
                <div className="lookup-edit-form">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleEditSave(item.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    aria-label={`Edit name for ${item.name}`}
                    autoFocus
                  />
                  <button className="btn-primary btn-small" onClick={() => handleEditSave(item.id)} disabled={saving}>
                    Save
                  </button>
                  <button className="btn-secondary btn-small" onClick={() => setEditingId(null)} disabled={saving}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className="lookup-item-name">{item.name}</span>
                  <div className="lookup-item-actions">
                    <button className="btn-secondary btn-small" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button className="btn-danger btn-small" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
            {deleteErrors[item.id] && (
              <span className="lookup-item-error">{deleteErrors[item.id]}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
