import { useState, useMemo } from 'react';
import useCrud from '../../hooks/useCrud';
import usePagination from '../../hooks/usePagination';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/Loaders';
import FileUploadField from '../../components/FileUploadField';

const EMPTY = { clubName: '', facultyInCharge: '', president: '', description: '', imageUrl: '' };

const CLUB_ICONS = ['🏆', '🎭', '💻', '🎵', '📸', '⚽', '🎨', '🔬', '📚', '🌍'];

const ClubList = () => {
  const { data, loading, create } = useCrud('/clubs');
  const { toast } = useToast();
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EVENT_COORDINATOR';
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter((c) => `${c.clubName} ${c.facultyInCharge} ${c.president}`.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  const { paged, Pagination } = usePagination(filtered, 9);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.clubName) return toast('Club name is required', 'error');
    setSaving(true);
    try {
      await create(form);
      toast('Club created');
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
          <div className="page-title">Clubs</div>
          <div className="page-subtitle">{data.length} active clubs</div>
        </div>
        {canEdit && <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal(true); }}>+ Create Club</button>}
      </div>

      <div className="mb-3">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search clubs…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {paged.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🏆</div><p>No clubs found</p></div>
      ) : (
        <div className="row g-3">
          {paged.map((c, i) => (
            <div key={c.id} className="col-md-6 col-lg-4">
              <div className="card h-100" style={{ borderRadius: 12, border: '1px solid var(--border)', transition: 'box-shadow 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, overflow: 'hidden' }}>
                      {c.imageUrl ? <img src={c.imageUrl} alt={c.clubName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : CLUB_ICONS[i % CLUB_ICONS.length]}
                    </div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: 15 }}>{c.clubName}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>{c.description || 'No description provided.'}</p>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Faculty</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{c.facultyInCharge || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>President</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{c.president || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3"><Pagination /></div>

      {modal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Club</h5>
                <button className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Club Name *</label>
                      <input className="form-control" value={form.clubName} onChange={(e) => set('clubName', e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Faculty In Charge</label>
                      <input className="form-control" value={form.facultyInCharge} onChange={(e) => set('facultyInCharge', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">President</label>
                      <input className="form-control" value={form.president} onChange={(e) => set('president', e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
                    </div>
                    <div className="col-12">
                      <FileUploadField
                        label="Club Logo"
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
                    Create Club
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

export default ClubList;
