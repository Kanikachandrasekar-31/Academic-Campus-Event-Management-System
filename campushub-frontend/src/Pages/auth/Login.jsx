import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Login = () => {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast('Please fill all fields', 'error');
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email: form.email, password: form.password });
      login({ ...data, name: data.name || data.email });
      toast('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast('Please fill all fields', 'error');
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department,
      });
      toast('Account created! Please login.');
      setMode('login');
    } catch (err) {
      toast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-visual">
        <svg width="260" height="220" viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>
          {/* Campus building */}
          <rect x="55" y="110" width="150" height="80" rx="4" fill="rgba(255,255,255,0.14)" />
          <rect x="55" y="110" width="150" height="12" fill="rgba(255,255,255,0.22)" />
          <polygon points="45,110 130,70 215,110" fill="rgba(255,255,255,0.22)" />
          <rect x="122" y="150" width="16" height="40" rx="2" fill="rgba(255,255,255,0.35)" />
          <rect x="70" y="130" width="14" height="18" rx="2" fill="rgba(255,255,255,0.3)" />
          <rect x="95" y="130" width="14" height="18" rx="2" fill="rgba(255,255,255,0.3)" />
          <rect x="150" y="130" width="14" height="18" rx="2" fill="rgba(255,255,255,0.3)" />
          <rect x="175" y="130" width="14" height="18" rx="2" fill="rgba(255,255,255,0.3)" />

          {/* Graduation cap */}
          <g transform="translate(130,30)">
            <polygon points="0,0 45,17 0,34 -45,17" fill="#fff" opacity="0.95" />
            <rect x="-6" y="17" width="12" height="22" rx="2" fill="rgba(255,255,255,0.7)" />
            <circle cx="38" cy="21" r="3" fill="#fff" />
            <line x1="38" y1="21" x2="38" y2="40" stroke="#fff" strokeWidth="1.5" />
          </g>

          {/* Books */}
          <g transform="translate(20,175)">
            <rect x="0" y="0" width="34" height="8" rx="1.5" fill="#fff" opacity="0.9" />
            <rect x="2" y="-8" width="30" height="8" rx="1.5" fill="rgba(255,255,255,0.7)" />
            <rect x="4" y="-16" width="26" height="8" rx="1.5" fill="rgba(255,255,255,0.5)" />
          </g>

          {/* Sparkles */}
          <circle cx="210" cy="55" r="2.5" fill="#fff" opacity="0.8" />
          <circle cx="230" cy="90" r="1.8" fill="#fff" opacity="0.6" />
          <circle cx="30" cy="70" r="2" fill="#fff" opacity="0.6" />
        </svg>
        <div className="login-visual-text">
          <h2>Welcome to CampusHub</h2>
          <p>One platform for attendance, marks, assignments, campus events, and everything in between — for students, faculty, and staff alike.</p>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <div className="login-logo">C</div>
          <h4 className="text-center fw-bold mb-1">CampusHub</h4>
          <p className="text-center text-muted mb-4" style={{ fontSize: 13 }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            {mode === 'register' && (
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input className="form-control" placeholder="John Doe" value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
            )}
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} />
            </div>
            {mode === 'register' && (
              <>
                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <input className="form-control" placeholder="e.g. Computer Science" value={form.department} onChange={(e) => set('department', e.target.value)} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  This creates a <strong>student</strong> account. Faculty, Event Coordinator, and Admin accounts are created by an administrator.
                </div>
              </>
            )}
            <button type="submit" className="btn btn-primary w-100 mt-1" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-3 mb-0" style={{ fontSize: 13 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              className="btn btn-link p-0"
              style={{ fontSize: 13 }}
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
