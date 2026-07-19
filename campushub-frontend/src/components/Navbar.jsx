import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { IconMenu, IconSun, IconMoon } from './Icons';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/faculty': 'Faculty',
  '/attendance': 'Attendance',
  '/marks': 'Marks',
  '/assignments': 'Assignments',
  '/materials': 'Study Materials',
  '/events': 'Events',
  '/venues': 'Venues',
  '/registrations': 'Registrations',
  '/clubs': 'Clubs',
  '/announcements': 'Announcements',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'CampusHub';

  return (
    <header className="top-navbar">
      <button
        className="btn btn-light btn-sm d-md-none me-2 btn-icon"
        onClick={onMenuClick}
      >
        <IconMenu size={17} />
      </button>
      <span className="navbar-title">{title}</span>
      <div className="d-flex align-items-center gap-3">
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <IconMoon size={16} /> : <IconSun size={16} />}
        </button>
        <div className="d-flex align-items-center gap-2">
          <div className="navbar-avatar">
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="d-none d-sm-block">
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user?.name || user?.email}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;