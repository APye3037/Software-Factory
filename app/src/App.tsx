import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import GameLibraryPage from './pages/GameLibraryPage'
import PlayersPage from './pages/PlayersPage'
import SessionsPage from './pages/SessionsPage'
import GameStatsPage from './pages/GameStatsPage'
import PlayerStatsPage from './pages/PlayerStatsPage'
import LookupsPage from './pages/LookupsPage'

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/games" replace />} />
          <Route path="/games" element={<GameLibraryPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/stats/games" element={<GameStatsPage />} />
          <Route path="/stats/players" element={<PlayerStatsPage />} />
          <Route path="/lookups" element={<LookupsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
