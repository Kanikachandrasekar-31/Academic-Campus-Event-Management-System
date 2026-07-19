import { useState, useMemo, useEffect } from 'react';
import useCrud from '../../hooks/useCrud';
import usePagination from '../../hooks/usePagination';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { SkeletonTable } from '../../components/Loaders';
import ConfirmDialog from '../../components/ConfirmDialog';
import QuickGrid from '../../components/QuickGrid';
import { api } from '../../utils/api';

const EMPTY = { studentName: '', registerNumber: '', department: '', subject: '', attendanceDate: '', status: 'Present' };
const STATUSES = ['Present', 'Absent', 'Late'];
const DEPTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];

const Attendance = () => {
  const { data, loading, create, update, remove, reload } = useCrud('/attendance');
  const { toast } = useToast();
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'FACULTY';
  const [myRegNumber, setMyRegNumber] = useState(undefined); // undefined = still loading, null = no linked record
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'attendanceDate', dir: -1 });
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      api.get('/students/me').then((s) => setMyRegNumber(s?.registerNumber || null)).catch(() => setMyRegNumber(null));
    }
  }, [user]);

  const filtered = useMemo(() => {
    let d = user?.role === 'STUDENT' ? data.filter((a) => a.registerNumber === myRegNumber) : [...data];
    if (search) d = d.filter((a) => `${a.studentName} ${a.registerNumber} ${a.subject}`.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus) d = d.filter((a) => a.status === filterStatus);
    d.sort((a, b) => {
      const av = (a[sort.key] || '').toString().toLowerCase();
      const bv = (b[sort.key] || '').toString().toLowerCase();
      return av < bv ? -sort.dir : av > bv ? sort.dir : 0;
    });
    return d;
  }, [data, search, sort, filterStatus, myRegNumber, user]);

  const { paged, Pagination } = usePagination(filtered, 10);
  const toggleSort = (key) => setSort((p) => ({ key, dir: p.key === key ? -p.dir : 1 }));
  const sortIcon = (key) => sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : '';

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (a) => { setEditing(a); setForm({ ...a }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.studentName || !form.registerNumber) return toast('Student name and register number required', 'error');
    setSaving(true);
    try {
      if (editing) { await update(editing.id, form); toast('Attendance updated'); }
      else { await create(form); toast('Attendance recorded'); }
      setModal(false);
    } catch (err) {
      toast(err.message || 'Operation failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await remove(confirm); toast('Record deleted'); }
    catch (err) { toast(err.message || 'Delete failed', 'error'); }
    finally { setConfirm(null); }
  };

  const statusBadge = (s) => {
    const map = { Present: 'bg-success', Absent: 'bg-danger', Late: 'bg-warning text-dark' };
    return <span className={`badge ${map[s] || 'bg-secondary'} bg-opacity-15 text-${s === 'Present' ? 'success' : s === 'Absent' ? 'danger' : 'warning'}`}>{s}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Attendance</div>
          <div className="page-subtitle">{data.length} attendance records</div>
        </div>
        {canEdit && <button className="btn btn-primary" onClick={openAdd}>+ Mark Attendance</button>}
      </div>

      {canEdit && <QuickGrid mode="attendance" onSaved={reload} />}

      <div className="table-card">
        <div className="table-header">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search attendance…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select form-select-sm" style={{ width: 140 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} results</span>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => toggleSort('studentName')}>Student{sortIcon('studentName')}</th>
                <th>Reg. No.</th>
                <th>Department</th>
                <th className="sortable" onClick={() => toggleSort('subject')}>Subject{sortIcon('subject')}</th>
                <th className="sortable" onClick={() => toggleSort('attendanceDate')}>Date{sortIcon('attendanceDate')}</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonTable rows={6} cols={7} /> : paged.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">✅</div><p>No attendance records</p></div></td></tr>
              ) : paged.map((a) => (
                <tr key={a.id}>
                  <td className="fw-semibold">{a.studentName}</td>
                  <td><span className="badge bg-light text-dark">{a.registerNumber}</span></td>
                  <td>{a.department}</td>
                  <td>{a.subject}</td>
                  <td>{a.attendanceDate}</td>
                  <td>{statusBadge(a.status)}</td>
                  <td>
                    {canEdit ? (
                      <>
                        <button className="btn btn-sm btn-light me-1" onClick={() => openEdit(a)}>Edit</button>
                        <button className="btn btn-sm btn-light text-danger" onClick={() => setConfirm(a.id)}>Delete</button>
                      </>
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
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? 'Edit Attendance' : 'Mark Attendance'}</h5>
                <button className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Student Name *</label>
                      <input className="form-control" value={form.studentName} onChange={(e) => set('studentName', e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Register Number *</label>
                      <input className="form-control" value={form.registerNumber} onChange={(e) => set('registerNumber', e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <select className="form-select" value={form.department} onChange={(e) => set('department', e.target.value)}>
                        <option value="">Select</option>
                        {DEPTS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Subject</label>
                      <input className="form-control" value={form.subject} onChange={(e) => set('subject', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" value={form.attendanceDate} onChange={(e) => set('attendanceDate', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm me-2" />}
                    {editing ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog show={!!confirm} title="Delete Record" message="Delete this attendance record?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
    </div>
  );
};

export default Attendance;
