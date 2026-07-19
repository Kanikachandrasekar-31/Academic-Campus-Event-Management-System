import { useState, useMemo } from 'react';
import useCrud from '../../hooks/useCrud';
import usePagination from '../../hooks/usePagination';
import { useToast } from '../../context/ToastContext';
import { SkeletonTable } from '../../components/Loaders';
import ConfirmDialog from '../../components/ConfirmDialog';
import FileUploadField from '../../components/FileUploadField';

const EMPTY = { name: '', location: '', capacity: '', available: true, imageUrl: '' };

const Venue = () => {
  const { data, loading, create, update, remove } = useCrud('/venues');
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'name', dir: 1 });
  const [filterAvail, setFilterAvail] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = useMemo(() => {
    let d = [...data];
    if (search) d = d.filter((v) => `${v.name} ${v.location}`.toLowerCase().includes(search.toLowerCase()));
    if (filterAvail !== '') d = d.filter((v) => String(v.available) === filterAvail);
    d.sort((a, b) => {
      const av = (a[sort.key] || '').toString().toLowerCase();
      const bv = (b[sort.key] || '').toString().toLowerCase();
      return av < bv ? -sort.dir : av > bv ? sort.dir : 0;
    });
    return d;
  }, [data, search, sort, filterAvail]);

  const { paged, Pagination } = usePagination(filtered, 10);
  const toggleSort = (key) => setSort((p) => ({ key, dir: p.key === key ? -p.dir : 1 }));
  const sortIcon = (key) => sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : '';

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (v) => { setEditing(v); setForm({ ...v }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return toast('Venue name is required', 'error');
    setSaving(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity), available: form.available === true || form.available === 'true' };
      if (editing) { await update(editing.id, payload); toast('Venue updated'); }
      else { await create(payload); toast('Venue added'); }
      setModal(false);
    } catch (err) {
      toast(err.message || 'Operation failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await remove(confirm); toast('Venue deleted'); }
    catch (err) { toast(err.message || 'Delete failed', 'error'); }
    finally { setConfirm(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Venues</div>
          <div className="page-subtitle">{data.length} venues registered</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Venue</button>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search venues…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select form-select-sm" style={{ width: 150 }} value={filterAvail} onChange={(e) => setFilterAvail(e.target.value)}>
            <option value="">All Status</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} results</span>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Photo</th>
                <th className="sortable" onClick={() => toggleSort('name')}>Name{sortIcon('name')}</th>
                <th className="sortable" onClick={() => toggleSort('location')}>Location{sortIcon('location')}</th>
                <th className="sortable" onClick={() => toggleSort('capacity')}>Capacity{sortIcon('capacity')}</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonTable rows={6} cols={6} /> : paged.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">🏛️</div><p>No venues found</p></div></td></tr>
              ) : paged.map((v) => (
                <tr key={v.id}>
                  <td>
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt={v.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 6, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏛️</div>
                    )}
                  </td>
                  <td className="fw-semibold">{v.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{v.location}</td>
                  <td>{v.capacity?.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${v.available ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${v.available ? 'text-success' : 'text-danger'}`}>
                      {v.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-light me-1" onClick={() => openEdit(v)}>Edit</button>
                    <button className="btn btn-sm btn-light text-danger" onClick={() => setConfirm(v.id)}>Delete</button>
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
                <h5 className="modal-title">{editing ? 'Edit Venue' : 'Add Venue'}</h5>
                <button className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Venue Name *</label>
                      <input className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Location</label>
                      <input className="form-control" value={form.location} onChange={(e) => set('location', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Capacity</label>
                      <input type="number" className="form-control" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Availability</label>
                      <select className="form-select" value={String(form.available)} onChange={(e) => set('available', e.target.value === 'true')}>
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <FileUploadField
                        label="Venue Photo"
                        value={form.imageUrl}
                        onChange={(url) => set('imageUrl', url)}
                        accept="image/*"
                        isImage
                      />
                      <input className="form-control mt-2" placeholder="…or paste an image URL" value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm me-2" />}
                    {editing ? 'Update' : 'Add Venue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog show={!!confirm} title="Delete Venue" message="Delete this venue?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
    </div>
  );
};

export default Venue;
