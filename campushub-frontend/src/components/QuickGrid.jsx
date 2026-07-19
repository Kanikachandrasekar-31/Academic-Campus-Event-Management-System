import { useState, useEffect, useMemo } from 'react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';

const DEPTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
const YEARS = ['1', '2', '3', '4'];
const SECTIONS = ['A', 'B', 'C', 'D'];

const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Excel-style bulk entry: filter to a class (or leave "All"), the whole
 * roster shows up immediately as a table — no separate "create a group"
 * step first. Tick present/absent (or type marks) per row, hit Save once.
 *
 * mode: 'attendance' | 'marks'
 * onSaved: called after a successful save so the page's flat list below can refresh.
 */
const QuickGrid = ({ mode, onSaved }) => {
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dept, setDept] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState({}); // { [studentId]: { status } | { internal1, internal2, assignment } }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/students').then(setStudents).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const roster = useMemo(() => students.filter((s) =>
    (!dept || (s.department || '').trim().toLowerCase() === dept.toLowerCase()) &&
    (!year || (s.year || '').trim() === year) &&
    (!section || (s.section || '').trim().toUpperCase() === section.toUpperCase())
  ), [students, dept, year, section]);

  const rowFor = (id) => rows[id] || (mode === 'attendance' ? { status: 'Present' } : { internal1: 0, internal2: 0, assignment: 0 });
  const setRow = (id, patch) => setRows((p) => ({ ...p, [id]: { ...rowFor(id), ...patch } }));

  const markAll = (status) => {
    const next = {};
    roster.forEach((s) => { next[s.id] = { status }; });
    setRows((p) => ({ ...p, ...next }));
  };

  const save = async () => {
    if (!subject.trim()) return toast('Enter a subject first');
    if (roster.length === 0) return toast('No students match this filter yet');
    setSaving(true);
    try {
      for (const s of roster) {
        const row = rowFor(s.id);
        if (mode === 'attendance') {
          await api.post('/attendance', {
            studentName: s.name, registerNumber: s.registerNumber, department: s.department,
            subject, attendanceDate: date, status: row.status,
          });
        } else {
          await api.post('/marks', {
            studentName: s.name, registerNumber: s.registerNumber, subject,
            internal1: Number(row.internal1) || 0, internal2: Number(row.internal2) || 0, assignment: Number(row.assignment) || 0,
          });
        }
      }
      toast(`Saved ${mode === 'attendance' ? 'attendance' : 'marks'} for ${roster.length} student(s)`);
      onSaved && onSaved();
    } catch (err) {
      toast(err.message || 'Some records failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-3 mb-3">
      <div className="fw-semibold mb-2" style={{ fontSize: 14 }}>
        📊 Quick {mode === 'attendance' ? 'Attendance' : 'Marks'} — fill the whole class at once
      </div>

      <div className="d-flex gap-2 flex-wrap mb-2">
        <select className="form-select form-select-sm" style={{ width: 180 }} value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">All Departments</option>
          {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="form-select form-select-sm" style={{ width: 110 }} value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">All Years</option>
          {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
        </select>
        <select className="form-select form-select-sm" style={{ width: 130 }} value={section} onChange={(e) => setSection(e.target.value)}>
          <option value="">All Sections</option>
          {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>
        <input className="form-control form-control-sm" style={{ width: 180 }} placeholder="Subject *" value={subject} onChange={(e) => setSubject(e.target.value)} />
        {mode === 'attendance' && (
          <input type="date" className="form-control form-control-sm" style={{ width: 160 }} value={date} onChange={(e) => setDate(e.target.value)} />
        )}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 'auto' }}>{roster.length} student(s)</span>
      </div>

      {mode === 'attendance' && roster.length > 0 && (
        <div className="d-flex gap-2 mb-2">
          <button className="btn btn-sm btn-outline-success" onClick={() => markAll('Present')}>Mark all Present</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => markAll('Absent')}>Mark all Absent</button>
        </div>
      )}

      {loading ? (
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading students…</div>
      ) : roster.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No students found — add students on the Students page, or widen the filters above.</div>
      ) : (
        <>
          <div style={{ maxHeight: 340, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
            <table className="table table-sm mb-0">
              <thead style={{ position: 'sticky', top: 0, background: 'var(--surface, #fff)', zIndex: 1 }}>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Register No.</th>
                  {mode === 'attendance' ? (
                    <th style={{ width: 200 }}>Present / Absent</th>
                  ) : (
                    <>
                      <th style={{ width: 90 }}>Internal 1</th>
                      <th style={{ width: 90 }}>Internal 2</th>
                      <th style={{ width: 90 }}>Assignment</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {roster.map((s, i) => {
                  const row = rowFor(s.id);
                  return (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td>{s.name}</td>
                      <td>{s.registerNumber}</td>
                      {mode === 'attendance' ? (
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              type="button"
                              className={`btn ${row.status === 'Present' ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => setRow(s.id, { status: 'Present' })}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              className={`btn ${row.status === 'Absent' ? 'btn-danger' : 'btn-outline-danger'}`}
                              onClick={() => setRow(s.id, { status: 'Absent' })}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td><input type="number" className="form-control form-control-sm" value={row.internal1} onChange={(e) => setRow(s.id, { internal1: e.target.value })} /></td>
                          <td><input type="number" className="form-control form-control-sm" value={row.internal2} onChange={(e) => setRow(s.id, { internal2: e.target.value })} /></td>
                          <td><input type="number" className="form-control form-control-sm" value={row.assignment} onChange={(e) => setRow(s.id, { assignment: e.target.value })} /></td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button className="btn btn-primary mt-2" disabled={saving} onClick={save}>
            {saving ? 'Saving…' : `Save for ${roster.length} student(s)`}
          </button>
        </>
      )}
    </div>
  );
};

export default QuickGrid;
