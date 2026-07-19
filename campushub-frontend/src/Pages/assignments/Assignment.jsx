import { useState, useMemo, useEffect } from 'react';
import useCrud from '../../hooks/useCrud';
import usePagination from '../../hooks/usePagination';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { SkeletonTable } from '../../components/Loaders';
import ConfirmDialog from '../../components/ConfirmDialog';
import FileUploadField from '../../components/FileUploadField';
import { api } from '../../utils/api';

const DEPTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
const YEARS = ['1', '2', '3', '4'];
const SECTIONS = ['A', 'B', 'C', 'D'];

const EMPTY = { title: '', description: '', subject: '', facultyName: '', dueDate: '', attachmentUrl: '', targetDepartment: '', targetYear: '', targetSection: '' };

const Assignment = () => {
  const { data, loading, create, update, remove } = useCrud('/assignments');
  const { toast } = useToast();
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'FACULTY';
  const [myGroup, setMyGroup] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'dueDate', dir: 1 });
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      api.get('/students/me').then(setMyGroup).catch(() => {});
    }
  }, [user]);

  // An item with no target fields is for everyone; otherwise every set field must match the student's own class.
  const isForMe = (item) => {
    if (user?.role !== 'STUDENT') return true;
    const scoped = item.targetDepartment || item.targetYear || item.targetSection;
    if (!scoped) return true;
    if (!myGroup) return false;
    const match = (a, b) => !a || (b && a.trim().toLowerCase() === b.trim().toLowerCase());
    return match(item.targetDepartment, myGroup.department) && match(item.targetYear, myGroup.year) && match(item.targetSection, myGroup.section);
  };

  const filtered = useMemo(() => {
    let d = data.filter(isForMe);
    if (search) d = d.filter((a) => `${a.title} ${a.subject} ${a.facultyName}`.toLowerCase().includes(search.toLowerCase()));
    d.sort((a, b) => {
      const av = (a[sort.key] || '').toString().toLowerCase();
      const bv = (b[sort.key] || '').toString().toLowerCase();
      return av < bv ? -sort.dir : av > bv ? sort.dir : 0;
    });
    return d;
  }, [data, search, sort, myGroup, user]);

  const { paged, Pagination } = usePagination(filtered, 10);
  const toggleSort = (key) => setSort((p) => ({ key, dir: p.key === key ? -p.dir : 1 }));
  const sortIcon = (key) => sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : '';

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (a) => { setEditing(a); setForm({ ...a }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) return toast('Title is required', 'error');
    setSaving(true);
    try {
      if (editing) { await update(editing.id, form); toast('Assignment updated'); }
      else { await create(form); toast('Assignment created'); }
      setModal(false);
    } catch (err) {
      toast(err.message || 'Operation failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await remove(confirm); toast('Assignment deleted'); }
    catch (err) { toast(err.message || 'Delete failed', 'error'); }
    finally { setConfirm(null); }
  };

  const isDue = (date) => date && new Date(date) < new Date();

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Assignments</div>
          <div className="page-subtitle">{data.length} assignments</div>
        </div>
        {canEdit && <button className="btn btn-primary" onClick={openAdd}>+ Add Assignment</button>}
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search assignments…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} results</span>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => toggleSort('title')}>Title{sortIcon('title')}</th>
                <th className="sortable" onClick={() => toggleSort('subject')}>Subject{sortIcon('subject')}</th>
                <th>Class</th>
                <th>Faculty</th>
                <th className="sortable" onClick={() => toggleSort('dueDate')}>Due Date{sortIcon('dueDate')}</th>
                <th>Attachment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonTable rows={6} cols={7} /> : paged.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">📝</div><p>No assignments found</p></div></td></tr>
              ) : paged.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="fw-semibold">{a.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.description?.slice(0, 60)}{a.description?.length > 60 ? '…' : ''}</div>
                  </td>
                  <td><span className="badge" style={{ background: '#f5f3ff', color: '#7c3aed' }}>{a.subject}</span></td>
                  <td>
                    {(a.targetDepartment || a.targetYear || a.targetSection) ? (
                      <span style={{ fontSize: 12 }}>{[a.targetDepartment, a.targetYear && `Yr ${a.targetYear}`, a.targetSection].filter(Boolean).join(' • ')}</span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>All Classes</span>
                    )}
                  </td>
                  <td>{a.facultyName}</td>
                  <td>
                    <span className={isDue(a.dueDate) ? 'text-danger fw-semibold' : ''}>{a.dueDate}</span>
                    {isDue(a.dueDate) && <span className="badge bg-danger bg-opacity-10 text-danger ms-1">Overdue</span>}
                  </td>
                  <td>
                    {a.attachmentUrl ? (
                      <a href={a.attachmentUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-light">View</a>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
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
                <h5 className="modal-title">{editing ? 'Edit Assignment' : 'Add Assignment'}</h5>
                <button className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Title *</label>
                      <input className="form-control" value={form.title} onChange={(e) => set('title', e.target.value)} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Subject</label>
                      <input className="form-control" value={form.subject} onChange={(e) => set('subject', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Faculty Name</label>
                      <input className="form-control" value={form.facultyName} onChange={(e) => set('facultyName', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Due Date</label>
                      <input type="date" className="form-control" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <FileUploadField
                        label="Attachment"
                        value={form.attachmentUrl}
                        onChange={(url) => set('attachmentUrl', url)}
                      />
                      <input className="form-control mt-2" placeholder="…or paste a URL" value={form.attachmentUrl} onChange={(e) => set('attachmentUrl', e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Target Class <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(leave blank for all students)</span></label>
                      <div className="row g-2">
                        <div className="col-md-4">
                          <select className="form-select" value={form.targetDepartment} onChange={(e) => set('targetDepartment', e.target.value)}>
                            <option value="">All Departments</option>
                            {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <select className="form-select" value={form.targetYear} onChange={(e) => set('targetYear', e.target.value)}>
                            <option value="">All Years</option>
                            {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <select className="form-select" value={form.targetSection} onChange={(e) => set('targetSection', e.target.value)}>
                            <option value="">All Sections</option>
                            {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm me-2" />}
                    {editing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog show={!!confirm} title="Delete Assignment" message="Delete this assignment?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
    </div>
  );
};

export default Assignment;
