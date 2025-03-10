import { NavLink } from 'react-router-dom';
import { FaHome, FaHeart, FaList } from 'react-icons/fa';

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Rythimic Tunes</h2>
      <nav>
        <NavLink to="/" className="nav-link"><FaHome /> Songs</NavLink>
        <NavLink to="/favorites" className="nav-link"><FaHeart /> Favorites</NavLink>
        <NavLink to="/playlist" className="nav-link"><FaList /> Playlist</NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;