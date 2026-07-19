import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../utils/api';

const Settings = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({ email: true, announcements: true, events: false });
  const { theme, setTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [calendar, setCalendar] = useState({ configured: true, connected: false, loading: true });

  useEffect(() => {
    const result = searchParams.get('calendar');
    if (result === 'connected') toast('Google Calendar connected!');
    if (result === 'error') toast('Could not connect Google Calendar — please try again.');
    if (result) setSearchParams({}, { replace: true });
  }, [searchParams]);

  useEffect(() => {
    api.get('/calendar/status')
      .then((res) => setCalendar({ ...res, loading: false }))
      .catch(() => setCalendar({ configured: true, connected: false, loading: false }));
  }, []);

  const connectCalendar = async () => {
    try {
      const res = await api.get('/calendar/connect');
      if (!res.configured) {
        toast(res.message || 'Google Calendar is not configured on the server yet.');
        return;
      }
      window.location.href = res.authUrl;
    } catch (err) {
      toast(err.message || 'Could not start Google Calendar connection.');
    }
  };

  const disconnectCalendar = async () => {
    try {
      await api.post('/calendar/disconnect', {});
      setCalendar((p) => ({ ...p, connected: false }));
      toast('Google Calendar disconnected');
    } catch (err) {
      toast(err.message || 'Could not disconnect Google Calendar.');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast('Settings saved successfully');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Manage your preferences</div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card p-4">
            <div className="fw-semibold mb-3" style={{ fontSize: 15 }}>🔔 Notification Preferences</div>
            <form onSubmit={handleSave}>
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                { key: 'announcements', label: 'Announcement Alerts', desc: 'Get notified for new announcements' },
                { key: 'events', label: 'Event Reminders', desc: 'Reminders for upcoming events' },
              ].map((item) => (
                <div key={item.key} className="d-flex align-items-center justify-content-between py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={(e) => setNotifications((p) => ({ ...p, [item.key]: e.target.checked }))}
                      style={{ width: 40, height: 22, cursor: 'pointer' }}
                    />
                  </div>
                </div>
              ))}
              <button type="submit" className="btn btn-primary mt-3">Save Preferences</button>
            </form>
          </div>

          <div className="card p-4 mt-3">
            <div className="fw-semibold mb-3" style={{ fontSize: 15 }}>📅 Google Calendar</div>
            {calendar.loading ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Checking connection…</div>
            ) : !calendar.configured ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Google Calendar sync hasn't been set up by your administrator yet.
              </div>
            ) : calendar.connected ? (
              <>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  ✅ Connected — new assignments and events will be added to your Google Calendar automatically.
                </div>
                <button className="btn btn-outline-danger btn-sm" onClick={disconnectCalendar}>Disconnect</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Connect your Google account so new assignments and campus events are added to your calendar automatically.
                </div>
                <button className="btn btn-primary btn-sm" onClick={connectCalendar}>Connect Google Calendar</button>
              </>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card p-4">
            <div className="fw-semibold mb-3" style={{ fontSize: 15 }}>🎨 Appearance</div>
            <div className="row g-2">
              {['light', 'dark'].map((t) => (
                <div key={t} className="col-6">
                  <div
                    className={`p-3 rounded cursor-pointer ${theme === t ? 'border border-primary' : 'border'}`}
                    style={{ cursor: 'pointer', background: theme === t ? 'var(--primary-light)' : '#f8fafc' }}
                    onClick={() => setTheme(t)}
                  >
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{t === 'light' ? '☀️' : '🌙'}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>{t}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 mt-3">
            <div className="fw-semibold mb-3" style={{ fontSize: 15 }}>ℹ️ About</div>
            {[
              { label: 'Application', value: 'CampusHub' },
              { label: 'Version', value: '1.0.0' },
              { label: 'Backend', value: 'Spring Boot 3 · Port 8082' },
              { label: 'Frontend', value: 'React 19 · Vite 8' },
            ].map((item) => (
              <div key={item.label} className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                <span className="fw-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
