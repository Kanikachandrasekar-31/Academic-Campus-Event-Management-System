import { useState, useMemo } from 'react';
import useCrud from '../../hooks/useCrud';
import usePagination from '../../hooks/usePagination';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/Loaders';

const EMPTY = { title: '', message: '', postedBy: '', postedDate: '' };

const Announcement = () => {
  const { data, loading, create } = useCrud('/announcements');
  const { toast } = useToast();
  const { user } = useAuth();
  const canPost = user?.role === 'ADMIN' || user?.role === 'FACULTY' || user?.role === 'EVENT_COORDINATOR';
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter((a) => `${a.title} ${a.message} ${a.postedBy}`.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  const { paged, Pagination } = usePagination(filtered, 9);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) return toast('Title and message are required', 'error');
    setSaving(true);
    try {
      await create({ ...form, postedDate: form.postedDate || new Date().toISOString().split('T')[0] });
      toast('Announcement posted');
      setModal(false);
      setForm(EMPTY);
    } catch (err) {
      toast(err.message || 'Operation failed', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Announcements</div>
          <div className="page-subtitle">{data.length} announcements</div>
        </div>
        {canPost && <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal(true); }}>+ Post Announcement</button>}
      </div>

      <div className="mb-3">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search announcements…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {paged.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📢</div><p>No announcements found</p></div>
      ) : (
        <div className="row g-3">
          {paged.map((a) => (
            <div key={a.id} className="col-md-6 col-lg-4">
              <div className="card h-100" style={{ borderRadius: 12, border: '1px solid var(--border)' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      📢
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="fw-semibold" style={{ fontSize: 14 }}>{a.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.postedBy} · {a.postedDate}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>{a.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3">
        <Pagination />
      </div>

      {modal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Post Announcement</h5>
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
                      <label className="form-label">Message *</label>
                      <textarea className="form-control" rows={4} value={form.message} onChange={(e) => set('message', e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Posted By</label>
                      <input className="form-control" value={form.postedBy} onChange={(e) => set('postedBy', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" value={form.postedDate} onChange={(e) => set('postedDate', e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm me-2" />}
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcement;
