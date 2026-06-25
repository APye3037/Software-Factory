import { useGameTypes } from '../hooks/useGameTypes'
import { useManufacturers } from '../hooks/useManufacturers'
import { createGameType, updateGameType, deleteGameType } from '../api/gameTypes'
import { createManufacturer, updateManufacturer, deleteManufacturer } from '../api/manufacturers'
import LookupTable from '../components/LookupTable'

export default function LookupsPage() {
  const { gameTypes, loading: gtLoading, error: gtError, refresh: gtRefresh } = useGameTypes()
  const { manufacturers, loading: mLoading, error: mError, refresh: mRefresh } = useManufacturers()

  async function handleAddGameType(name: string) {
    await createGameType(name)
    await gtRefresh()
  }

  async function handleEditGameType(id: number, name: string) {
    await updateGameType(id, name)
    await gtRefresh()
  }

  async function handleDeleteGameType(id: number) {
    await deleteGameType(id)
    await gtRefresh()
  }

  async function handleAddManufacturer(name: string) {
    await createManufacturer(name)
    await mRefresh()
  }

  async function handleEditManufacturer(id: number, name: string) {
    await updateManufacturer(id, name)
    await mRefresh()
  }

  async function handleDeleteManufacturer(id: number) {
    await deleteManufacturer(id)
    await mRefresh()
  }

  return (
    <div>
      <div className="page-header">
        <h1>Lookups</h1>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <LookupTable
          title="Game Types"
          items={gameTypes}
          loading={gtLoading}
          error={gtError}
          onAdd={handleAddGameType}
          onEdit={handleEditGameType}
          onDelete={handleDeleteGameType}
        />
        <LookupTable
          title="Manufacturers"
          items={manufacturers}
          loading={mLoading}
          error={mError}
          onAdd={handleAddManufacturer}
          onEdit={handleEditManufacturer}
          onDelete={handleDeleteManufacturer}
        />
      </div>
    </div>
  )
}
