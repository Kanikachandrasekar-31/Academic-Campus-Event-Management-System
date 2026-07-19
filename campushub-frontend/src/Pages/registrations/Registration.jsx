import { useState, useMemo, useEffect } from 'react';
import useCrud from '../../hooks/useCrud';
import usePagination from '../../hooks/usePagination';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { SkeletonTable } from '../../components/Loaders';
import ConfirmDialog from '../../components/ConfirmDialog';
import { api } from '../../utils/api';

const EMPTY = { student: { id: '' }, event: { id: '' }, registrationDate: '' };

const Registration = () => {
  const { data, loading, create, remove } = useCrud('/registrations');
  const { toast } = useToast();
  const { user } = useAuth();
  const canDelete = user?.role === 'ADMIN' || user?.role === 'EVENT_COORDINATOR';
  const canCreate = user?.role === 'ADMIN' || user?.role === 'EVENT_COORDINATOR';
  const isStudent = user?.role === 'STUDENT';
  const [myStudentId, setMyStudentId] = useState(undefined);
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/students').then(setStudents).catch(() => {});
    api.get('/events').then(setEvents).catch(() => {});
    if (isStudent) {
      api.get('/students/me').then((s) => setMyStudentId(s?.id ?? null)).catch(() => setMyStudentId(null));
    }
  }, [isStudent]);

  const filtered = useMemo(() => {
    let d = isStudent ? data.filter((r) => r.student?.id === myStudentId) : data;
    if (!search) return d;
    return d.filter((r) =>
      `${r.student?.name} ${r.event?.eventName} ${r.registrationDate}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search, isStudent, myStudentId]);

  const { paged, Pagination } = usePagination(filtered, 10);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.student.id || !form.event.id) return toast('Select student and event', 'error');
    setSaving(true);
    try {
      await create({
        student: { id: Number(form.student.id) },
        event: { id: Number(form.event.id) },
        registrationDate: form.registrationDate || new Date().toISOString().split('T')[0],
      });
      toast('Registration created');
      setModal(false);
      setForm(EMPTY);
    } catch (err) {
      toast(err.message || 'Operation failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await remove(confirm); toast('Registration deleted'); }
    catch (err) { toast(err.message || 'Delete failed', 'error'); }
    finally { setConfirm(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Registrations</div>
          <div className="page-subtitle">{data.length} event registrations</div>
        </div>
        {canCreate && <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal(true); }}>+ New Registration</button>}
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search registrations…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} results</span>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Register No.</th>
                <th>Event</th>
                <th>Event Date</th>
                <th>Venue</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonTable rows={6} cols={8} /> : paged.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">📋</div><p>No registrations found</p></div></td></tr>
              ) : paged.map((r, i) => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td className="fw-semibold">{r.student?.name}</td>
                  <td><span className="badge bg-light text-dark">{r.student?.registerNumber}</span></td>
                  <td>{r.event?.eventName}</td>
                  <td>{r.event?.eventDate}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.event?.venue || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.registrationDate}</td>
                  <td>
                    {canDelete ? (
                      <button className="btn btn-sm btn-light text-danger" onClick={() => setConfirm(r.id)}>Delete</button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination />
      </div>

      {modal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Registration</h5>
                <button className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Student *</label>
                      <select className="form-select" value={form.student.id} onChange={(e) => setForm((p) => ({ ...p, student: { id: e.target.value } }))} required>
                        <option value="">Select Student</option>
                        {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.registerNumber})</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Event *</label>
                      <select className="form-select" value={form.event.id} onChange={(e) => setForm((p) => ({ ...p, event: { id: e.target.value } }))} required>
                        <option value="">Select Event</option>
                        {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.eventName} ({ev.eventDate})</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Registration Date</label>
                      <input type="date" className="form-control" value={form.registrationDate} onChange={(e) => setForm((p) => ({ ...p, registrationDate: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm me-2" />}
                    Register
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog show={!!confirm} title="Delete Registration" message="Delete this registration?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
    </div>
  );
};

export default Registration;
