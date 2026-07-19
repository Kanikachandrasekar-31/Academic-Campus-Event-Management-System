import { useState, useMemo } from 'react';
import useCrud from '../../hooks/useCrud';
import usePagination from '../../hooks/usePagination';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { SkeletonTable } from '../../components/Loaders';
import ConfirmDialog from '../../components/ConfirmDialog';

const ROLES = ['ADMIN', 'FACULTY', 'EVENT_COORDINATOR', 'STUDENT'];
const EMPTY = { name: '', email: '', password: '', role: 'STUDENT', department: '', enabled: true };

const roleBadge = (role) => {
  const colors = {
    ADMIN: { bg: '#fef2f2', fg: '#dc2626' },
    FACULTY: { bg: '#eff6ff', fg: '#2563eb' },
    EVENT_COORDINATOR: { bg: '#f5f3ff', fg: '#7c3aed' },
    STUDENT: { bg: '#ecfdf5', fg: '#059669' },
  };
  const c = colors[role] || { bg: '#f1f5f9', fg: '#475569' };
  return <span className="badge" style={{ background: c.bg, color: c.fg }}>{role?.replace('_', ' ')}</span>;
};

const UserManagement = () => {
  const { data, loading, create, update, remove } = useCrud('/users');
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = useMemo(() => {
    let d = [...data];
    if (search) d = d.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()));
    if (filterRole) d = d.filter((u) => u.role === filterRole);
    return d;
  }, [data, search, filterRole]);

  const { paged, Pagination } = usePagination(filtered, 10);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ ...EMPTY, ...u, password: '' }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast('Name and Email are required', 'error');
    if (!editing && !form.password) return toast('Password is required for a new account', 'error');
    setSaving(true);
    try {
      if (editing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password; // don't reset password unless a new one was typed
        await update(editing.id, payload);
        toast('Account updated');
      } else {
        await create(form);
        toast('Account created');
      }
      setModal(false);
    } catch (err) {
      toast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try { await remove(confirm); toast('Account deleted'); }
    catch (err) { toast(err.message || 'Delete failed', 'error'); }
    finally { setConfirm(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">User Accounts</div>
          <div className="page-subtitle">{data.length} accounts — manage staff and student logins</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Account</button>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select form-select-sm" style={{ width: 180 }} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">All Roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} results</span>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonTable rows={6} cols={6} /> : paged.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">👤</div><p>No accounts found</p></div></td></tr>
              ) : paged.map((u) => (
                <tr key={u.id}>
                  <td className="fw-semibold">{u.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td>{roleBadge(u.role)}</td>
                  <td>{u.department || '—'}</td>
                  <td>
                    {u.enabled ? (
                      <span className="badge" style={{ background: '#ecfdf5', color: '#059669' }}>Active</span>
                    ) : (
                      <span className="badge" style={{ background: '#fef2f2', color: '#dc2626' }}>Disabled</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-light me-1" onClick={() => openEdit(u)}>Edit</button>
                    <button
                      className="btn btn-sm btn-light text-danger"
                      disabled={u.email === currentUser?.email}
                      title={u.email === currentUser?.email ? "You can't delete your own account" : ''}
                      onClick={() => setConfirm(u.id)}
                    >
                      Delete
                    </button>
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
                <h5 className="modal-title">{editing ? 'Edit Account' : 'Add Account'}</h5>
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
                      <input type="email" className="form-control" value={form.email} onChange={(e) => set('email', e.target.value)} required disabled={!!editing} />
                      {editing && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Email can't be changed after an account is created.</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Role *</label>
                      <select className="form-select" value={form.role} onChange={(e) => set('role', e.target.value)}>
                        {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <input className="form-control" placeholder="e.g. Computer Science" value={form.department} onChange={(e) => set('department', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">{editing ? 'New Password' : 'Password *'}</label>
                      <input type="password" className="form-control" placeholder={editing ? 'Leave blank to keep current' : ''} value={form.password} onChange={(e) => set('password', e.target.value)} required={!editing} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={String(form.enabled)} onChange={(e) => set('enabled', e.target.value === 'true')}>
                        <option value="true">Active</option>
                        <option value="false">Disabled</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm me-2" />}
                    {editing ? 'Save Changes' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog show={!!confirm} title="Delete Account" message="Delete this account? They'll no longer be able to log in." onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
    </div>
  );
};

export default UserManagement;
