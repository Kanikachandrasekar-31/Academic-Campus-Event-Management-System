import { useState, useMemo } from 'react';
import useCrud from '../../hooks/useCrud';
import usePagination from '../../hooks/usePagination';
import { useToast } from '../../context/ToastContext';
import { SkeletonTable } from '../../components/Loaders';
import ConfirmDialog from '../../components/ConfirmDialog';

const EMPTY = { name: '', registerNumber: '', department: '', year: '', email: '', phone: '' };
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const DEPTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];

const StudentList = () => {
  const { data, loading, create, update, remove } = useCrud('/students');
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'name', dir: 1 });
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = useMemo(() => {
    let d = [...data];
    if (search) d = d.filter((s) => `${s.name} ${s.registerNumber} ${s.email}`.toLowerCase().includes(search.toLowerCase()));
    if (filterDept) d = d.filter((s) => s.department === filterDept);
    if (filterYear) d = d.filter((s) => s.year === filterYear);
    d.sort((a, b) => {
      const av = (a[sort.key] || '').toString().toLowerCase();
      const bv = (b[sort.key] || '').toString().toLowerCase();
      return av < bv ? -sort.dir : av > bv ? sort.dir : 0;
    });
    return d;
  }, [data, search, sort, filterDept, filterYear]);

  const { paged, Pagination } = usePagination(filtered, 10);

  const toggleSort = (key) => setSort((p) => ({ key, dir: p.key === key ? -p.dir : 1 }));
  const sortIcon = (key) => sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : '';

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...s }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.registerNumber) return toast('Name and Register Number are required', 'error');
    setSaving(true);
    try {
      if (editing) {
        await update(editing.id, form);
        toast('Student updated successfully');
      } else {
        await create(form);
        toast('Student added successfully');
      }
      setModal(false);
    } catch (err) {
      toast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await remove(confirm);
      toast('Student deleted');
    } catch (err) {
      toast(err.message || 'Delete failed', 'error');
    } finally {
      setConfirm(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Students</div>
          <div className="page-subtitle">{data.length} total students enrolled</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Student</button>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search students…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select form-select-sm" style={{ width: 160 }} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {DEPTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select className="form-select form-select-sm" style={{ width: 130 }} value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="">All Years</option>
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} results</span>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => toggleSort('name')}>Name{sortIcon('name')}</th>
                <th className="sortable" onClick={() => toggleSort('registerNumber')}>Reg. No{sortIcon('registerNumber')}</th>
                <th className="sortable" onClick={() => toggleSort('department')}>Department{sortIcon('department')}</th>
                <th className="sortable" onClick={() => toggleSort('year')}>Year{sortIcon('year')}</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTable rows={8} cols={7} />
              ) : paged.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">🎓</div><p>No students found</p></div></td></tr>
              ) : (
                paged.map((s) => (
                  <tr key={s.id}>
                    <td className="fw-semibold">{s.name}</td>
                    <td><span className="badge bg-light text-dark">{s.registerNumber}</span></td>
                    <td>{s.department}</td>
                    <td>{s.year}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.phone}</td>
                    <td>
                      <button className="btn btn-sm btn-light me-1" onClick={() => openEdit(s)}>✏️</button>
                      <button className="btn btn-sm btn-light text-danger" onClick={() => setConfirm(s.id)}>🗑️</button>
                    </td>
                  </tr>
                ))
              )}
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
                <h5 className="modal-title">{editing ? 'Edit Student' : 'Add Student'}</h5>
                <button className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Register Number *</label>
                      <input className="form-control" value={form.registerNumber} onChange={(e) => set('registerNumber', e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <select className="form-select" value={form.department} onChange={(e) => set('department', e.target.value)}>
                        <option value="">Select Department</option>
                        {DEPTS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Year</label>
                      <select className="form-select" value={form.year} onChange={(e) => set('year', e.target.value)}>
                        <option value="">Select Year</option>
                        {YEARS.map((y) => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={form.email} onChange={(e) => set('email', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input className="form-control" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                    {editing ? 'Update' : 'Add Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={!!confirm}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default StudentList;
