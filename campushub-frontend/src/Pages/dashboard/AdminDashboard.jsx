import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  IconStudents, IconFaculty, IconEvents, IconRegistrations, IconVenues,
  IconClubs, IconAnnouncements, IconArrowRight, IconPlus,
} from '../../components/Icons';

const KPI = ({ Icon, label, value, to, navigate }) => (
  <div className="stat-card" style={{ cursor: to ? 'pointer' : 'default' }} onClick={() => to && navigate(to)}>
    <div className="d-flex align-items-center justify-content-between mb-3">
      <div className="stat-icon"><Icon size={18} /></div>
      {to && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
          Manage <IconArrowRight size={12} />
        </span>
      )}
    </div>
    <div className="stat-value tnum">
      {value === null ? (
        <div style={{ width: 46, height: 24, background: 'var(--skeleton)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
      ) : value}
    </div>
    <div className="stat-label mt-1">{label}</div>
  </div>
);

const ActionTile = ({ Icon, label, desc, to, navigate }) => (
  <div
    className="d-flex align-items-center gap-3 p-3 rounded"
    style={{ cursor: 'pointer', border: '1px solid var(--border)', transition: 'all 0.15s' }}
    onClick={() => navigate(to)}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
  >
    <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={16} />
    </div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
    </div>
  </div>
);

// Pure-SVG donut chart — single accent hue at varying opacity, not a rainbow
const RoleDonut = ({ segments }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="d-flex align-items-center gap-4 flex-wrap">
      <svg width="146" height="146" viewBox="0 0 146 146">
        <circle cx="73" cy="73" r={radius} fill="none" stroke="var(--border)" strokeWidth="16" />
        {segments.map((seg, i) => {
          const length = (seg.value / total) * circumference;
          const dasharray = `${length} ${circumference - length}`;
          const circle = (
            <circle
              key={i}
              cx="73" cy="73" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={dasharray}
              strokeDashoffset={-offset}
              transform="rotate(-90 73 73)"
            />
          );
          offset += length;
          return circle;
        })}
        <text x="73" y="69" textAnchor="middle" fontSize="21" fontWeight="700" fill="var(--text)">{total}</text>
        <text x="73" y="86" textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">TOTAL USERS</text>
      </svg>
      <div style={{ minWidth: 150 }}>
        {segments.map((seg) => (
          <div key={seg.label} className="d-flex align-items-center gap-2 mb-2">
            <div style={{ width: 9, height: 9, borderRadius: 2.5, background: seg.color, flexShrink: 0 }} />
            <div style={{ fontSize: 12.5, flex: 1, color: 'var(--text-muted)' }}>{seg.label}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700 }} className="tnum">{seg.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const kpis = [
    { Icon: IconStudents, label: 'Students', value: stats?.students ?? null, to: '/students' },
    { Icon: IconFaculty, label: 'Faculty', value: stats?.faculty ?? null, to: '/faculty' },
    { Icon: IconEvents, label: 'Events', value: stats?.events ?? null, to: '/events' },
    { Icon: IconRegistrations, label: 'Registrations', value: stats?.registrations ?? null, to: '/registrations' },
    { Icon: IconVenues, label: 'Venues', value: stats?.venues ?? null, to: '/venues' },
    { Icon: IconClubs, label: 'Clubs', value: stats?.clubs ?? null, to: '/clubs' },
    { Icon: IconAnnouncements, label: 'Announcements', value: stats?.announcements ?? null, to: '/announcements' },
  ];

  // One accent hue at descending opacity — reads as a designed system, not a rainbow
  const roleSegments = [
    { label: 'Students', value: stats?.studentRoleCount ?? 0, color: 'var(--accent)' },
    { label: 'Faculty', value: stats?.facultyRoleCount ?? 0, color: '#818CF8' },
    { label: 'Event Coordinators', value: stats?.coordinatorRoleCount ?? 0, color: '#B4B8F5' },
    { label: 'Admins', value: stats?.adminCount ?? 0, color: '#D9DBF7' },
  ];

  const actions = [
    { Icon: IconStudents, label: 'Add Student', desc: 'Enroll a new student', to: '/students' },
    { Icon: IconFaculty, label: 'Add Faculty', desc: 'Onboard a faculty member', to: '/faculty' },
    { Icon: IconEvents, label: 'Create Event', desc: 'Schedule a campus event', to: '/events' },
    { Icon: IconVenues, label: 'Add Venue', desc: 'Register a new venue', to: '/venues' },
    { Icon: IconAnnouncements, label: 'Post Announcement', desc: 'Notify the campus', to: '/announcements' },
    { Icon: IconClubs, label: 'Manage Clubs', desc: 'View & edit clubs', to: '/clubs' },
  ];

  return (
    <div>
      {/* Header banner */}
      <div
        className="mb-4"
        style={{
          borderRadius: 14,
          padding: '22px 26px',
          background: 'var(--rail-bg)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Admin Control Center
          </div>
          <div style={{ fontSize: 13, color: 'var(--rail-text)', marginTop: 4 }}>
            {user?.name || user?.email?.split('@')[0]} · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <button
          className="btn btn-sm"
          style={{ background: 'var(--rail-accent)', color: 'white', border: 'none' }}
          onClick={() => navigate('/events')}
        >
          <IconPlus size={14} /> Create Event
        </button>
      </div>

      {/* KPI row */}
      <div className="row g-3 mb-4">
        {kpis.map((c) => (
          <div key={c.label} className="col-6 col-md-4 col-lg-3">
            <KPI {...c} navigate={navigate} />
          </div>
        ))}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-lg-5">
          <div className="table-card h-100">
            <div className="table-header">
              <span className="table-title">User Role Distribution</span>
            </div>
            <div className="p-4">
              <RoleDonut segments={roleSegments} />
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="table-card h-100">
            <div className="table-header">
              <span className="table-title">Quick Admin Actions</span>
            </div>
            <div className="p-3">
              <div className="row g-2">
                {actions.map((a) => (
                  <div key={a.label} className="col-md-6">
                    <ActionTile {...a} navigate={navigate} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="table-card">
            <div className="table-header">
              <span className="table-title"><IconEvents size={15} /> Upcoming Events</span>
              <button className="btn btn-sm btn-light" onClick={() => navigate('/events')}>View All</button>
            </div>
            {loading ? (
              <div style={{ padding: 20 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="d-flex gap-3 mb-3">
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--skeleton)', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 14, background: 'var(--skeleton)', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
                      <div style={{ height: 12, background: 'var(--skeleton)', borderRadius: 4, width: '60%', animation: 'pulse 1.5s infinite' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><IconEvents size={32} /></div>
                <p>No events scheduled yet</p>
                <button className="btn btn-sm btn-primary mt-2" onClick={() => navigate('/events')}>Create Event</button>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>Event</th><th>Date</th><th>Time</th><th>Venue</th></tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.id}>
                      <td>
                        <div className="fw-semibold" style={{ fontSize: 13 }}>{ev.eventName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ev.organizer}</div>
                      </td>
                      <td style={{ fontSize: 13 }} className="tnum">{ev.eventDate}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }} className="tnum">{ev.eventTime || '—'}</td>
                      <td><span className="badge bg-light" style={{ fontSize: 11 }}>{ev.venue || '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="table-card">
            <div className="table-header">
              <span className="table-title"><IconAnnouncements size={15} /> Announcements</span>
              <button className="btn btn-sm btn-light" onClick={() => navigate('/announcements')}>View All</button>
            </div>
            {loading ? (
              <div style={{ padding: '8px 0' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ height: 13, background: 'var(--skeleton)', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: 11, background: 'var(--skeleton)', borderRadius: 4, width: '50%', animation: 'pulse 1.5s infinite' }} />
                  </div>
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><IconAnnouncements size={32} /></div>
                <p>No announcements yet</p>
              </div>
            ) : (
              <div>
                {announcements.map((a) => (
                  <div key={a.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light)' }}>
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

export default AdminDashboard;