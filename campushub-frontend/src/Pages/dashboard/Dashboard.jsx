import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import FacultyDashboard from './FacultyDashboard';
const StatCard = ({ icon, label, value, color, bg, onClick }) => (
  <div
    className="stat-card"
    onClick={onClick}
    style={{ cursor: 'pointer' }}
  >
    <div className="d-flex align-items-center justify-content-between mb-3">
      <div className="stat-icon" style={{ background: bg, color }}>
        {icon}
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>View →</span>
    </div>
    <div className="stat-value">
      {value === null ? (
        <div style={{ width: 60, height: 28, background: '#e9ecef', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
      ) : value}
    </div>
    <div className="stat-label mt-1">{label}</div>
  </div>
);

const QuickLink = ({ icon, label, desc, color, bg, to, navigate }) => (
  <div
    className="d-flex align-items-center gap-3 p-3 rounded"
    style={{ cursor: 'pointer', border: '1px solid var(--border)', transition: 'all 0.15s' }}
    onClick={() => navigate(to)}
    onMouseEnter={(e) => { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = color + '40'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
  >
    <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
 
  if (user?.role === 'ADMIN') return <AdminDashboard />;
   if (user?.role === 'FACULTY') return <FacultyDashboard />;



  useEffect(() => {
    const load = async () => {
      try {
        const [s, e, a] = await Promise.all([
          api.get('/dashboard'),
          api.get('/events'),
          api.get('/announcements'),
        ]);
        setStats(s);
        setEvents((e || []).slice(0, 5));
        setAnnouncements((a || []).slice(0, 4));
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const isStudent = user?.role === 'STUDENT';
  const isCoordinator = user?.role === 'EVENT_COORDINATOR';

  const statCards = isStudent
    ? [
        { icon: '🎉', label: 'Total Events', value: stats?.events ?? null, color: '#059669', bg: '#ecfdf5', to: '/events' },
        { icon: '📋', label: 'My Registrations', value: stats?.registrations ?? null, color: '#d97706', bg: '#fffbeb', to: '/registrations' },
        { icon: '🎭', label: 'Clubs', value: stats?.clubs ?? null, color: '#7c3aed', bg: '#f5f3ff', to: '/clubs' },
        { icon: '📢', label: 'Announcements', value: announcements.length || null, color: '#0891b2', bg: '#ecfeff', to: '/announcements' },
      ]
    : isCoordinator
    ? [
        { icon: '🎉', label: 'Total Events', value: stats?.events ?? null, color: '#059669', bg: '#ecfdf5', to: '/events' },
        { icon: '📋', label: 'Registrations', value: stats?.registrations ?? null, color: '#d97706', bg: '#fffbeb', to: '/registrations' },
        { icon: '🏛️', label: 'Venues', value: stats?.venues ?? null, color: '#dc2626', bg: '#fef2f2', to: '/venues' },
        { icon: '🎭', label: 'Clubs', value: stats?.clubs ?? null, color: '#7c3aed', bg: '#f5f3ff', to: '/clubs' },
        { icon: '📢', label: 'Announcements', value: announcements.length || null, color: '#0891b2', bg: '#ecfeff', to: '/announcements' },
      ]
    : [
        { icon: '🎓', label: 'Total Students', value: stats?.students ?? null, color: '#2563eb', bg: '#eff6ff', to: '/students' },
        { icon: '👨🏫', label: 'Faculty Members', value: null, color: '#7c3aed', bg: '#f5f3ff', to: '/faculty' },
        { icon: '🎉', label: 'Total Events', value: stats?.events ?? null, color: '#059669', bg: '#ecfdf5', to: '/events' },
        { icon: '📋', label: 'Registrations', value: stats?.registrations ?? null, color: '#d97706', bg: '#fffbeb', to: '/registrations' },
        { icon: '🏛️', label: 'Venues', value: stats?.venues ?? null, color: '#dc2626', bg: '#fef2f2', to: '/venues' },
        { icon: '📢', label: 'Announcements', value: announcements.length || null, color: '#0891b2', bg: '#ecfeff', to: '/announcements' },
      ];

  // Load faculty count separately (Admin only endpoint — this component only
  // renders for Student/Coordinator, who never see the faculty stat card anyway)
  useEffect(() => {
    if (isStudent || isCoordinator) return;
    api.get('/faculty').then((d) => {
      setStats((p) => p ? { ...p, faculty: d?.length || 0 } : p);
    }).catch(() => {});
  }, []);

  const quickLinks = isStudent
    ? [
        { icon: '🎉', label: 'Browse Events', desc: 'See what\'s coming up', color: '#059669', bg: '#ecfdf5', to: '/events' },
        { icon: '✅', label: 'My Attendance', desc: 'Check your attendance %', color: '#7c3aed', bg: '#f5f3ff', to: '/attendance' },
        { icon: '📊', label: 'My Marks', desc: 'View your marks', color: '#d97706', bg: '#fffbeb', to: '/marks' },
        { icon: '📚', label: 'Assignments', desc: 'See what\'s due', color: '#2563eb', bg: '#eff6ff', to: '/assignments' },
      ]
    : isCoordinator
    ? [
        { icon: '🎉', label: 'Create Event', desc: 'Schedule a campus event', color: '#059669', bg: '#ecfdf5', to: '/events' },
        { icon: '🏛️', label: 'Add Venue', desc: 'Register a new venue', color: '#dc2626', bg: '#fef2f2', to: '/venues' },
        { icon: '🎭', label: 'Create Club', desc: 'Start a new club', color: '#7c3aed', bg: '#f5f3ff', to: '/clubs' },
        { icon: '📋', label: 'Registrations', desc: 'View event sign-ups', color: '#d97706', bg: '#fffbeb', to: '/registrations' },
      ]
    : [
        { icon: '🎓', label: 'Add Student', desc: 'Enroll a new student', color: '#2563eb', bg: '#eff6ff', to: '/students' },
        { icon: '🎉', label: 'Create Event', desc: 'Schedule a campus event', color: '#059669', bg: '#ecfdf5', to: '/events' },
        { icon: '✅', label: 'Mark Attendance', desc: 'Record attendance', color: '#7c3aed', bg: '#f5f3ff', to: '/attendance' },
        { icon: '📊', label: 'Enter Marks', desc: 'Add student marks', color: '#d97706', bg: '#fffbeb', to: '/marks' },
      ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            Welcome back, {user?.name || user?.email?.split('@')[0]} 👋
          </div>
          <div className="page-subtitle">
            Here's what's happening on campus today — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {statCards.map((c) => (
          <div key={c.label} className="col-6 col-md-4 col-lg-2">
            <StatCard
              {...c}
              value={c.label === 'Faculty Members' ? (stats?.faculty ?? null) : c.value}
              onClick={() => navigate(c.to)}
            />
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Upcoming Events */}
        <div className="col-lg-7">
          <div className="table-card">
            <div className="table-header">
              <span className="table-title">🎉 Upcoming Events</span>
              <button className="btn btn-sm btn-light" onClick={() => navigate('/events')}>View All</button>
            </div>
            {loading ? (
              <div style={{ padding: 20 }}>
                {[1,2,3].map((i) => (
                  <div key={i} className="d-flex gap-3 mb-3">
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#e9ecef', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 14, background: '#e9ecef', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
                      <div style={{ height: 12, background: '#e9ecef', borderRadius: 4, width: '60%', animation: 'pulse 1.5s infinite' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎉</div>
                <p>No events scheduled yet</p>
                <button className="btn btn-sm btn-primary mt-2" onClick={() => navigate('/events')}>Create Event</button>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.id}>
                      <td>
                        <div className="fw-semibold" style={{ fontSize: 13 }}>{ev.eventName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ev.organizer}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{ev.eventDate}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{ev.eventTime || '—'}</td>
                      <td><span className="badge bg-light text-dark" style={{ fontSize: 11 }}>{ev.venue || '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="col-lg-5">
          {/* Quick Actions */}
          <div className="table-card mb-3">
            <div className="table-header">
              <span className="table-title">⚡ Quick Actions</span>
            </div>
            <div className="p-3">
              <div className="row g-2">
                {quickLinks.map((q) => (
                  <div key={q.label} className="col-6">
                    <QuickLink {...q} navigate={navigate} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="table-card">
            <div className="table-header">
              <span className="table-title">📢 Announcements</span>
              <button className="btn btn-sm btn-light" onClick={() => navigate('/announcements')}>View All</button>
            </div>
            {loading ? (
              <div style={{ padding: '8px 0' }}>
                {[1,2,3].map((i) => (
                  <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ height: 13, background: '#e9ecef', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: 11, background: '#e9ecef', borderRadius: 4, width: '50%', animation: 'pulse 1.5s infinite' }} />
                  </div>
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📢</div>
                <p>No announcements yet</p>
              </div>
            ) : (
              <div>
                {announcements.map((a) => (
                  <div key={a.id} style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                    <div className="fw-semibold" style={{ fontSize: 13 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {a.postedBy} · {a.postedDate}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                      {a.message?.slice(0, 90)}{a.message?.length > 90 ? '…' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
