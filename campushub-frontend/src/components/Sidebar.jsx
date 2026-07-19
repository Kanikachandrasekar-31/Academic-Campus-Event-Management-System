import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconDashboard, IconStudents, IconFaculty, IconAttendance, IconMarks,
  IconAssignments, IconMaterials, IconEvents, IconVenues, IconRegistrations,
  IconClubs, IconAnnouncements, IconProfile, IconSettings, IconLogout,
} from './Icons';

const NAV = [
  {
    section: 'Main',
    links: [
      { to: '/dashboard', icon: IconDashboard, label: 'Dashboard' },
    ],
  },
  {
    section: 'Academic',
    links: [
      { to: '/students', icon: IconStudents, label: 'Students', roles: ['ADMIN', 'FACULTY'] },
      { to: '/faculty', icon: IconFaculty, label: 'Faculty', roles: ['ADMIN'] },
      { to: '/users', icon: IconFaculty, label: 'User Accounts', roles: ['ADMIN'] },
      { to: '/attendance', icon: IconAttendance, label: 'Attendance', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
      { to: '/marks', icon: IconMarks, label: 'Marks', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
      { to: '/assignments', icon: IconAssignments, label: 'Assignments', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
      { to: '/materials', icon: IconMaterials, label: 'Study Materials', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    ],
  },
 {
  section: 'Campus',
  links: [
    { to: '/events', icon: IconEvents, label: 'Events', roles: ['ADMIN', 'STUDENT', 'EVENT_COORDINATOR'] },
    { to: '/venues', icon: IconVenues, label: 'Venues', roles: ['ADMIN', 'EVENT_COORDINATOR'] },
    { to: '/registrations', icon: IconRegistrations, label: 'Registrations', roles: ['ADMIN', 'STUDENT', 'EVENT_COORDINATOR'] },
    { to: '/clubs', icon: IconClubs, label: 'Clubs', roles: ['ADMIN', 'STUDENT', 'EVENT_COORDINATOR'] },
    { to: '/announcements', icon: IconAnnouncements, label: 'Announcements' },
  ],
},
  {
    section: 'Account',
    links: [
      { to: '/profile', icon: IconProfile, label: 'Profile' },
      { to: '/settings', icon: IconSettings, label: 'Settings' },
    ],
  },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNav = NAV
    .map((section) => ({
      ...section,
      links: section.links.filter((link) => !link.roles || link.roles.includes(user?.role)),
    }))
    .filter((section) => section.links.length > 0);

  return (
    <>
      {open && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'var(--overlay)', zIndex: 999 }}
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">C</div>
          <div>
            <div className="sidebar-brand-text">CampusHub</div>
            <div className="sidebar-brand-sub">Campus Management</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleNav.map((section) => (
            <div key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.links.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-chip">
            <div className="navbar-avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#E6E9F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || user?.email}
              </div>
              <div style={{ fontSize: 11, color: 'var(--rail-text)' }}>{user?.role}</div>
            </div>
          </div>
          <button
            className="btn w-100 btn-sm"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--rail-border)', color: '#C7CCD8', justifyContent: 'center' }}
            onClick={handleLogout}
          >
            <IconLogout size={15} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;