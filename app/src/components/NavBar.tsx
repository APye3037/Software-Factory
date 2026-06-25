import { NavLink } from 'react-router-dom'
import './NavBar.css'

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/games" className="navbar-brand">
          Chuck Us the Meeples
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/games" className={({ isActive }) => isActive ? 'active' : undefined}>
            Games
          </NavLink>
          <NavLink to="/players" className={({ isActive }) => isActive ? 'active' : undefined}>
            Players
          </NavLink>
          <NavLink to="/sessions" className={({ isActive }) => isActive ? 'active' : undefined}>
            Sessions
          </NavLink>
          <NavLink to="/stats/games" className={({ isActive }) => isActive ? 'active' : undefined}>
            Game Stats
          </NavLink>
          <NavLink to="/stats/players" className={({ isActive }) => isActive ? 'active' : undefined}>
            Player Stats
          </NavLink>
          <NavLink to="/lookups" className={({ isActive }) => isActive ? 'active' : undefined}>
            Lookups
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
