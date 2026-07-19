import { useState, useMemo, useEffect } from 'react';
import useCrud from '../../hooks/useCrud';
import usePagination from '../../hooks/usePagination';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { SkeletonTable } from '../../components/Loaders';
import ConfirmDialog from '../../components/ConfirmDialog';
import FileUploadField from '../../components/FileUploadField';
import { api } from '../../utils/api';

const EMPTY = { eventName: '', eventDate: '', eventTime: '', venue: '', organizer: '', description: '', posterUrl: '' };

const EventList = () => {
  const { data, loading, create, update, remove } = useCrud('/events');
  const { toast } = useToast();
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EVENT_COORDINATOR';
  const isStudent = user?.role === 'STUDENT';
  const [myStudent, setMyStudent] = useState(null);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [registering, setRegistering] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'eventDate', dir: -1 });
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!isStudent) return;
    api.get('/students/me').then(setMyStudent).catch(() => {});
    api.get('/registrations').then((regs) => {
      setRegisteredEventIds(new Set((regs || []).map((r) => r.event?.id).filter(Boolean)));
    }).catch(() => {});
  }, [isStudent]);

  const registerForEvent = async (ev) => {
    if (!myStudent) {
      toast("Couldn't find your student record — contact your admin.");
      return;
    }
    setRegistering(ev.id);
    try {
      await api.post('/registrations', {
        student: { id: myStudent.id },
        event: { id: ev.id },
        registrationDate: new Date().toISOString().slice(0, 10),
      });
      setRegisteredEventIds((p) => new Set([...p, ev.id]));
      toast(`Registered for ${ev.eventName}`);
    } catch (err) {
      toast(err.message || 'Registration failed');
    } finally {
      setRegistering(null);
    }
  };

  const filtered = useMemo(() => {
    let d = [...data];
    if (search) d = d.filter((e) => `${e.eventName} ${e.venue} ${e.organizer}`.toLowerCase().includes(search.toLowerCase()));
    d.sort((a, b) => {
      const av = (a[sort.key] || '').toString().toLowerCase();
      const bv = (b[sort.key] || '').toString().toLowerCase();
      return av < bv ? -sort.dir : av > bv ? sort.dir : 0;
    });
    return d;
  }, [data, search, sort]);

  const { paged, Pagination } = usePagination(filtered, 10);
  const toggleSort = (key) => setSort((p) => ({ key, dir: p.key === key ? -p.dir : 1 }));
  const sortIcon = (key) => sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : '';

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (e) => { setEditing(e); setForm({ ...e }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.eventName || !form.eventDate) return toast('Event name and date are required', 'error');
    setSaving(true);
    try {
      if (editing) { await update(editing.id, form); toast('Event updated'); }
      else { await create(form); toast('Event created'); }
      setModal(false);
    } catch (err) {
      toast(err.message || 'Operation failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await remove(confirm); toast('Event deleted'); }
    catch (err) { toast(err.message || 'Delete failed', 'error'); }
    finally { setConfirm(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Events</div>
          <div className="page-subtitle">{data.length} events scheduled</div>
        </div>
        {canEdit && <button className="btn btn-primary" onClick={openAdd}>+ Create Event</button>}
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search events…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} results</span>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Poster</th>
                <th className="sortable" onClick={() => toggleSort('eventName')}>Event Name{sortIcon('eventName')}</th>
                <th className="sortable" onClick={() => toggleSort('eventDate')}>Date{sortIcon('eventDate')}</th>
                <th>Time</th>
                <th>Venue</th>
                <th className="sortable" onClick={() => toggleSort('organizer')}>Organizer{sortIcon('organizer')}</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonTable rows={6} cols={8} /> : paged.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">🎉</div><p>No events found</p></div></td></tr>
              ) : paged.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    {ev.posterUrl ? (
                      <img src={ev.posterUrl} alt={ev.eventName} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 6, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎉</div>
                    )}
                  </td>
                  <td className="fw-semibold">{ev.eventName}</td>
                  <td>{ev.eventDate}</td>
                  <td>{ev.eventTime}</td>
                  <td><span className="badge bg-light text-dark">{ev.venue}</span></td>
                  <td>{ev.organizer}</td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{ev.description}</td>
                  <td>
                    {canEdit ? (
                      <>
                        <button className="btn btn-sm btn-light me-1" onClick={() => openEdit(ev)}>Edit</button>
                        <button className="btn btn-sm btn-light text-danger" onClick={() => setConfirm(ev.id)}>Delete</button>
                      </>
                    ) : isStudent ? (
                      registeredEventIds.has(ev.id) ? (
                        <span className="badge" style={{ background: '#ecfdf5', color: '#059669', fontSize: 12 }}>✓ Registered</span>
                      ) : (
                        <button className="btn btn-sm btn-primary" disabled={registering === ev.id} onClick={() => registerForEvent(ev)}>
                          {registering === ev.id ? 'Registering…' : 'Register'}
                        </button>
                      )
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
                <h5 className="modal-title">{editing ? 'Edit Event' : 'Create Event'}</h5>
                <button className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Event Name *</label>
                      <input className="form-control" value={form.eventName} onChange={(e) => set('eventName', e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date *</label>
                      <input type="date" className="form-control" value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Time</label>
                      <input type="time" className="form-control" value={form.eventTime} onChange={(e) => set('eventTime', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Venue</label>
                      <input className="form-control" value={form.venue} onChange={(e) => set('venue', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Organizer</label>
                      <input className="form-control" value={form.organizer} onChange={(e) => set('organizer', e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
                    </div>
                    <div className="col-12">
                      <FileUploadField
                        label="Event Poster / Image"
                        value={form.posterUrl}
                        onChange={(url) => set('posterUrl', url)}
                        accept="image/*"
                        isImage
                      />
                      <input className="form-control mt-2" placeholder="…or paste an image URL" value={form.posterUrl} onChange={(e) => set('posterUrl', e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm me-2" />}
                    {editing ? 'Update' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog show={!!confirm} title="Delete Event" message="Delete this event?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
    </div>
  );
};

export default EventList;
