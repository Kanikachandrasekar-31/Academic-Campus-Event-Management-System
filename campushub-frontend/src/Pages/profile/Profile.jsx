import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [department, setDepartment] = useState('');
  const [form, setForm] = useState({ name: user?.name || '', department: '' });

  useEffect(() => {
    api.get('/profile/me').then((d) => {
      setDepartment(d.department || '');
      setForm({ name: d.name || user?.name || '', department: d.department || '' });
    }).catch(() => {});
  }, []);

  const initials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  const startEdit = () => {
    setForm({ name: user?.name || '', department });
    setEditing(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.put('/profile/me', { name: form.name, department: form.department });
      updateUser({ name: updated.name });
      setDepartment(updated.department || '');
      setEditing(false);
      toast('Profile updated');
    } catch (err) {
      toast(err.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Profile</div>
          <div className="page-subtitle">Your account information</div>
        </div>
        {!editing && <button className="btn btn-outline-primary btn-sm" onClick={startEdit}>Edit Profile</button>}
      </div>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card p-4 text-center">
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary)', color: 'white', fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              {initials}
            </div>
            <div className="fw-bold" style={{ fontSize: 18 }}>{user?.name || user?.email}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{user?.email}</div>
            <div className="mt-2">
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 12, padding: '5px 12px' }}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card p-4">
            <div className="fw-semibold mb-3" style={{ fontSize: 15 }}>Account Details</div>

            {editing ? (
              <form onSubmit={save}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Department</label>
                    <input className="form-control" placeholder="e.g. Computer Science" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email Address</label>
                    <input className="form-control" value={user?.email || ''} disabled />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Email can't be changed here.</div>
                  </div>
                </div>
                <div className="mt-3 d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
                  <button type="button" className="btn btn-light" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="row g-3">
                {[
                  { label: 'Full Name', value: user?.name || '—' },
                  { label: 'Email Address', value: user?.email || '—' },
                  { label: 'Role', value: user?.role?.replace('_', ' ') || '—' },
                  { label: 'Department', value: department || '—' },
                ].map((item) => (
                  <div key={item.label} className="col-md-6">
                    <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
