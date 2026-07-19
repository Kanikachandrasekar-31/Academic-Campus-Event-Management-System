import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  IconStudents, IconAttendance, IconMarks, IconAssignments,
  IconMaterials, IconEvents, IconArrowRight, IconPlus,
} from '../../components/Icons';

const KPI = ({ Icon, label, value, to, navigate }) => (
  <div className="stat-card" style={{ cursor: to ? 'pointer' : 'default' }} onClick={() => to && navigate(to)}>
    <div className="d-flex align-items-center justify-content-between mb-3">
      <div className="stat-icon"><Icon size={18} /></div>
      {to && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
          Open <IconArrowRight size={12} />
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

const riskBadgeClass = (level) => {
  if (level === 'High') return 'badge-danger';
  if (level === 'Medium') return 'badge-warning';
  return 'badge-success';
};

const FacultyDashboard = () => {
  const [studentCount, setStudentCount] = useState(null);
  const [atRisk, setAtRisk] = useState([]);
  const [events, setEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskLoading, setRiskLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a] = await Promise.all([
  api.get('/dashboard/students'),
  api.get('/assignments'),
]);
setStudentCount(s);
setAssignments((a || []).slice(0, 5));
      } catch (_) {}
      setLoading(false);

      try {
        const risk = await api.get('/analytics/at-risk-students');
        setAtRisk((risk || []).slice(0, 6));
      } catch (_) {}
      setRiskLoading(false);
    };
    load();
  }, []);

  const kpis = [
    { Icon: IconStudents, label: 'Total Students', value: studentCount, to: '/students' },
    { Icon: IconAttendance, label: 'Mark Attendance', value: null, to: '/attendance' },
    { Icon: IconMarks, label: 'Enter Marks', value: null, to: '/marks' },
    { Icon: IconAssignments, label: 'Assignments', value: null, to: '/assignments' },
  ];

  const actions = [
    { Icon: IconAttendance, label: 'Mark Attendance', desc: "Today's class attendance", to: '/attendance' },
    { Icon: IconMarks, label: 'Enter Marks', desc: 'Record internal marks', to: '/marks' },
    { Icon: IconAssignments, label: 'Post Assignment', desc: 'Set a new assignment', to: '/assignments' },
    { Icon: IconMaterials, label: 'Upload Material', desc: 'Share study resources', to: '/materials' },
  ];

  return (
    <div>
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
            Welcome back, {user?.name || user?.email?.split('@')[0]}
          </div>
          <div style={{ fontSize: 13, color: 'var(--rail-text)', marginTop: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <button
          className="btn btn-sm"
          style={{ background: 'var(--rail-accent)', color: 'white', border: 'none' }}
          onClick={() => navigate('/attendance')}
        >
          <IconPlus size={14} /> Mark Attendance
        </button>
      </div>

      <div className="row g-3 mb-4">
        {kpis.map((c) => (
          <div key={c.label} className="col-6 col-md-3">
            {c.value === null && c.label !== 'Total Students' ? (
              <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate(c.to)}>
                <div className="stat-icon mb-3"><c.Icon size={18} /></div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>Go to page →</div>
              </div>
            ) : (
              <KPI {...c} navigate={navigate} />
            )}
          </div>
        ))}
      </div>

      <div className="row g-3 mb-3">
        {/* AI At-Risk widget — the signature feature of this dashboard */}
        <div className="col-lg-7">
          <div className="table-card h-100">
            <div className="table-header">
              <span className="table-title">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  At-Risk Students
                  <span className="badge" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>AI-flagged</span>
                </span>
              </span>
            </div>
            <div style={{ padding: '4px 20px 8px', fontSize: 12, color: 'var(--text-muted)' }}>
              Flagged from attendance below 75% and average marks below 40, computed live from your records.
            </div>
            {riskLoading ? (
              <div style={{ padding: 20 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ height: 14, background: 'var(--skeleton)', borderRadius: 4, marginBottom: 10, animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : atRisk.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><IconStudents size={32} /></div>
                <p>No students currently flagged — great work!</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>Student</th><th>Attendance</th><th>Avg Marks</th><th>Risk</th></tr>
                </thead>
                <tbody>
                  {atRisk.map((s) => (
                    <tr key={s.registerNumber}>
                      <td>
                        <div className="fw-semibold" style={{ fontSize: 13 }}>{s.studentName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.registerNumber} · {s.primaryReason}</div>
                      </td>
                      <td className="tnum" style={{ fontSize: 13 }}>{s.attendancePercent}%</td>
                      <td className="tnum" style={{ fontSize: 13 }}>{s.averageMarks}</td>
                      <td><span className={`badge ${riskBadgeClass(s.riskLevel)}`}>{s.riskLevel}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="table-card h-100">
            <div className="table-header">
              <span className="table-title">Quick Actions</span>
            </div>
            <div className="p-3">
              <div className="d-flex flex-column gap-2">
                {actions.map((a) => (
                  <ActionTile key={a.label} {...a} navigate={navigate} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-card">
  <div className="table-header">
    <span className="table-title"><IconAssignments size={15} /> Recently Posted Assignments</span>
    <button className="btn btn-sm btn-light" onClick={() => navigate('/assignments')}>View All</button>
  </div>
  {loading ? (
    <div style={{ padding: 20 }}>
      <div style={{ height: 14, background: 'var(--skeleton)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
    </div>
  ) : assignments.length === 0 ? (
    <div className="empty-state">
      <div className="empty-state-icon"><IconAssignments size={32} /></div>
      <p>No assignments posted yet</p>
      <button className="btn btn-sm btn-primary mt-2" onClick={() => navigate('/assignments')}>Post Assignment</button>
    </div>
  ) : (
    <table className="table">
      <thead><tr><th>Title</th><th>Subject</th><th>Due Date</th></tr></thead>
      <tbody>
        {assignments.map((a) => (
          <tr key={a.id}>
            <td style={{ fontSize: 13 }}>{a.title}</td>
            <td><span className="badge bg-light" style={{ fontSize: 11 }}>{a.subject}</span></td>
            <td className="tnum" style={{ fontSize: 13 }}>{a.dueDate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
    </div>
  );
};

export default FacultyDashboard;