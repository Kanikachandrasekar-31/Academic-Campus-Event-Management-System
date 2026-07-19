import { useState, useMemo } from 'react';
import useCrud from '../../hooks/useCrud';
import usePagination from '../../hooks/usePagination';
import { useToast } from '../../context/ToastContext';
import { SkeletonTable } from '../../components/Loaders';
import ConfirmDialog from '../../components/ConfirmDialog';

const EMPTY = { name: '', email: '', department: '', designation: '', phone: '' };
const DEPTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'HOD'];

const FacultyList = () => {
  const { data, loading, create, update, remove } = useCrud('/faculty');
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'name', dir: 1 });
  const [filterDept, setFilterDept] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = useMemo(() => {
    let d = [...data];
    if (search) d = d.filter((f) => `${f.name} ${f.email} ${f.designation}`.toLowerCase().includes(search.toLowerCase()));
    if (filterDept) d = d.filter((f) => f.department === filterDept);
    d.sort((a, b) => {
      const av = (a[sort.key] || '').toString().toLowerCase();
      const bv = (b[sort.key] || '').toString().toLowerCase();
      return av < bv ? -sort.dir : av > bv ? sort.dir : 0;
    });
    return d;
  }, [data, search, sort, filterDept]);

  const { paged, Pagination } = usePagination(filtered, 10);
  const toggleSort = (key) => setSort((p) => ({ key, dir: p.key === key ? -p.dir : 1 }));
  const sortIcon = (key) => sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : '';

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (f) => { setEditing(f); setForm({ ...f }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast('Name and Email are required', 'error');
    setSaving(true);
    try {
      if (editing) { await update(editing.id, form); toast('Faculty updated'); }
      else { await create(form); toast('Faculty added'); }
      setModal(false);
    } catch (err) {
      toast(err.message || 'Operation failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await remove(confirm); toast('Faculty deleted'); }
    catch (err) { toast(err.message || 'Delete failed', 'error'); }
    finally { setConfirm(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Faculty</div>
          <div className="page-subtitle">{data.length} faculty members</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Faculty</button>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search faculty…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select form-select-sm" style={{ width: 170 }} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {DEPTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} results</span>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => toggleSort('name')}>Name{sortIcon('name')}</th>
                <th>Email</th>
                <th className="sortable" onClick={() => toggleSort('department')}>Department{sortIcon('department')}</th>
                <th className="sortable" onClick={() => toggleSort('designation')}>Designation{sortIcon('designation')}</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonTable rows={6} cols={6} /> : paged.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">👨‍🏫</div><p>No faculty found</p></div></td></tr>
              ) : paged.map((f) => (
                <tr key={f.id}>
                  <td className="fw-semibold">{f.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{f.email}</td>
                  <td>{f.department}</td>
                  <td><span className="badge" style={{ background: '#eff6ff', color: '#2563eb' }}>{f.designation}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{f.phone}</td>
                  <td>
                    <button className="btn btn-sm btn-light me-1" onClick={() => openEdit(f)}>Edit</button>
                    <button className="btn btn-sm btn-light text-danger" onClick={() => setConfirm(f.id)}>Delete</button>
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
                <h5 className="modal-title">{editing ? 'Edit Faculty' : 'Add Faculty'}</h5>
                <button className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Full Name *</label>
                      <input className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Email *</label>
                      <input type="email" className="form-control" value={form.email} onChange={(e) => set('email', e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <select className="form-select" value={form.department} onChange={(e) => set('department', e.target.value)}>
                        <option value="">Select</option>
                        {DEPTS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Designation</label>
                      <select className="form-select" value={form.designation} onChange={(e) => set('designation', e.target.value)}>
                        <option value="">Select</option>
                        {DESIGNATIONS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Phone</label>
                      <input className="form-control" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm me-2" />}
                    {editing ? 'Update' : 'Add Faculty'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog show={!!confirm} title="Delete Faculty" message="Delete this faculty member?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
    </div>
  );
};

export default FacultyList;
