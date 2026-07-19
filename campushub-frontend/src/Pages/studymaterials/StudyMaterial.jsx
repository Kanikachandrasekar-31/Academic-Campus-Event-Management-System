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

const EMPTY = { title: '', subject: '', semester: '', uploadedBy: '', uploadDate: '', attachmentUrl: '', targetDepartment: '', targetYear: '', targetSection: '' };
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

const StudyMaterial = () => {
  const { data, loading, create, update, remove } = useCrud('/materials');
  const { toast } = useToast();
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'FACULTY';
  const [myGroup, setMyGroup] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'uploadDate', dir: -1 });
  const [filterSem, setFilterSem] = useState('');
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
    if (search) d = d.filter((m) => `${m.title} ${m.subject} ${m.uploadedBy}`.toLowerCase().includes(search.toLowerCase()));
    if (filterSem) d = d.filter((m) => m.semester === filterSem);
    d.sort((a, b) => {
      const av = (a[sort.key] || '').toString().toLowerCase();
      const bv = (b[sort.key] || '').toString().toLowerCase();
      return av < bv ? -sort.dir : av > bv ? sort.dir : 0;
    });
    return d;
  }, [data, search, sort, filterSem, myGroup, user]);

  const { paged, Pagination } = usePagination(filtered, 10);
  const toggleSort = (key) => setSort((p) => ({ key, dir: p.key === key ? -p.dir : 1 }));
  const sortIcon = (key) => sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : '';

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (m) => { setEditing(m); setForm({ ...m }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) return toast('Title is required', 'error');
    setSaving(true);
    try {
      if (editing) { await update(editing.id, form); toast('Material updated'); }
      else { await create(form); toast('Material added'); }
      setModal(false);
    } catch (err) {
      toast(err.message || 'Operation failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await remove(confirm); toast('Material deleted'); }
    catch (err) { toast(err.message || 'Delete failed', 'error'); }
    finally { setConfirm(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Study Materials</div>
          <div className="page-subtitle">{data.length} materials uploaded</div>
        </div>
        {canEdit && <button className="btn btn-primary" onClick={openAdd}>+ Upload Material</button>}
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search materials…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select form-select-sm" style={{ width: 140 }} value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
            <option value="">All Semesters</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} results</span>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => toggleSort('title')}>Title{sortIcon('title')}</th>
                <th className="sortable" onClick={() => toggleSort('subject')}>Subject{sortIcon('subject')}</th>
                <th>Semester</th>
                <th>Class</th>
                <th>Uploaded By</th>
                <th className="sortable" onClick={() => toggleSort('uploadDate')}>Upload Date{sortIcon('uploadDate')}</th>
                <th>File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonTable rows={6} cols={8} /> : paged.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">📚</div><p>No materials found</p></div></td></tr>
              ) : paged.map((m) => (
                <tr key={m.id}>
                  <td className="fw-semibold">{m.title}</td>
                  <td><span className="badge" style={{ background: '#ecfdf5', color: '#059669' }}>{m.subject}</span></td>
                  <td>Sem {m.semester}</td>
                  <td>
                    {(m.targetDepartment || m.targetYear || m.targetSection) ? (
                      <span style={{ fontSize: 12 }}>{[m.targetDepartment, m.targetYear && `Yr ${m.targetYear}`, m.targetSection].filter(Boolean).join(' • ')}</span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>All Classes</span>
                    )}
                  </td>
                  <td>{m.uploadedBy}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{m.uploadDate}</td>
                  <td>
                    {m.attachmentUrl ? (
                      <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-light">📎 View</a>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
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
                <h5 className="modal-title">{editing ? 'Edit Material' : 'Upload Material'}</h5>
                <button className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Title *</label>
                      <input className="form-control" value={form.title} onChange={(e) => set('title', e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Subject</label>
                      <input className="form-control" value={form.subject} onChange={(e) => set('subject', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Semester</label>
                      <select className="form-select" value={form.semester} onChange={(e) => set('semester', e.target.value)}>
                        <option value="">Select</option>
                        {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Uploaded By</label>
                      <input className="form-control" value={form.uploadedBy} onChange={(e) => set('uploadedBy', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Upload Date</label>
                      <input type="date" className="form-control" value={form.uploadDate} onChange={(e) => set('uploadDate', e.target.value)} />
                    </div>
                    <div className="col-12">
                      <FileUploadField
                        label="Material File"
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
                    {editing ? 'Update' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog show={!!confirm} title="Delete Material" message="Delete this study material?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
    </div>
  );
};

export default StudyMaterial;
