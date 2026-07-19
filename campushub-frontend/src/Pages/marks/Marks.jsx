import { useState, useMemo, useEffect } from 'react';
import useCrud from '../../hooks/useCrud';
import usePagination from '../../hooks/usePagination';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { SkeletonTable } from '../../components/Loaders';
import ConfirmDialog from '../../components/ConfirmDialog';
import QuickGrid from '../../components/QuickGrid';
import { api } from '../../utils/api';

const EMPTY = { studentName: '', registerNumber: '', subject: '', internal1: 0, internal2: 0, assignment: 0 };

const Marks = () => {
  const { data, loading, create, update, remove, reload } = useCrud('/marks');
  const { toast } = useToast();
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'FACULTY';
  const [myRegNumber, setMyRegNumber] = useState(undefined);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'studentName', dir: 1 });
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
    let d = user?.role === 'STUDENT' ? data.filter((m) => m.registerNumber === myRegNumber) : [...data];
    if (search) d = d.filter((m) => `${m.studentName} ${m.registerNumber} ${m.subject}`.toLowerCase().includes(search.toLowerCase()));
    d.sort((a, b) => {
      const av = (a[sort.key] || '').toString().toLowerCase();
      const bv = (b[sort.key] || '').toString().toLowerCase();
      return av < bv ? -sort.dir : av > bv ? sort.dir : 0;
    });
    return d;
  }, [data, search, sort, myRegNumber, user]);

  const { paged, Pagination } = usePagination(filtered, 10);
  const toggleSort = (key) => setSort((p) => ({ key, dir: p.key === key ? -p.dir : 1 }));
  const sortIcon = (key) => sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : '';

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (m) => { setEditing(m); setForm({ ...m }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.studentName || !form.registerNumber) return toast('Student name and register number required', 'error');
    setSaving(true);
    try {
      const payload = { ...form, internal1: Number(form.internal1), internal2: Number(form.internal2), assignment: Number(form.assignment) };
      if (editing) { await update(editing.id, payload); toast('Marks updated'); }
      else { await create(payload); toast('Marks added'); }
      setModal(false);
    } catch (err) {
      toast(err.message || 'Operation failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await remove(confirm); toast('Marks deleted'); }
    catch (err) { toast(err.message || 'Delete failed', 'error'); }
    finally { setConfirm(null); }
  };

  const gradeColor = (total) => {
    if (total >= 80) return 'text-success';
    if (total >= 60) return 'text-primary';
    if (total >= 40) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Marks</div>
          <div className="page-subtitle">{data.length} mark records</div>
        </div>
        {canEdit && <button className="btn btn-primary" onClick={openAdd}>+ Add Marks</button>}
      </div>

      {canEdit && <QuickGrid mode="marks" onSaved={reload} />}

      <div className="table-card">
        <div className="table-header">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search marks…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} results</span>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => toggleSort('studentName')}>Student{sortIcon('studentName')}</th>
                <th>Reg. No.</th>
                <th className="sortable" onClick={() => toggleSort('subject')}>Subject{sortIcon('subject')}</th>
                <th>Internal 1</th>
                <th>Internal 2</th>
                <th>Assignment</th>
                <th className="sortable" onClick={() => toggleSort('total')}>Total{sortIcon('total')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonTable rows={6} cols={8} /> : paged.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">📊</div><p>No marks found</p></div></td></tr>
              ) : paged.map((m) => (
                <tr key={m.id}>
                  <td className="fw-semibold">{m.studentName}</td>
                  <td><span className="badge bg-light text-dark">{m.registerNumber}</span></td>
                  <td>{m.subject}</td>
                  <td>{m.internal1}</td>
                  <td>{m.internal2}</td>
                  <td>{m.assignment}</td>
                  <td className={`fw-bold ${gradeColor(m.total)}`}>{m.total}</td>
                  <td>
                    {canEdit ? (
                      <>
                        <button className="btn btn-sm btn-light me-1" onClick={() => openEdit(m)}>Edit</button>
                        <button className="btn btn-sm btn-light text-danger" onClick={() => setConfirm(m.id)}>Delete</button>
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
                <h5 className="modal-title">{editing ? 'Edit Marks' : 'Add Marks'}</h5>
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
                    <div className="col-12">
                      <label className="form-label">Subject</label>
                      <input className="form-control" value={form.subject} onChange={(e) => set('subject', e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Internal 1 (max 50)</label>
                      <input type="number" min={0} max={50} className="form-control" value={form.internal1} onChange={(e) => set('internal1', e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Internal 2 (max 50)</label>
                      <input type="number" min={0} max={50} className="form-control" value={form.internal2} onChange={(e) => set('internal2', e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Assignment (max 20)</label>
                      <input type="number" min={0} max={20} className="form-control" value={form.assignment} onChange={(e) => set('assignment', e.target.value)} />
                    </div>
                    <div className="col-12">
                      <div className="p-3 rounded" style={{ background: 'var(--primary-light)' }}>
                        <span className="fw-semibold text-primary">
                          Calculated Total: {Number(form.internal1) + Number(form.internal2) + Number(form.assignment)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm me-2" />}
                    {editing ? 'Update' : 'Save Marks'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog show={!!confirm} title="Delete Marks" message="Delete this marks record?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
    </div>
  );
};

export default Marks;
