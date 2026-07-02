import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export default function StudentLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'STUDENT') {
        setError('This portal is for students only. Please use the correct portal.');
        return;
      }
      navigate('/student/dashboard');
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : Object.values(msg || {})[0]?.[0] || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '24px'
    }}>
      {/* Background gradient orbs */}
      <div style={{
        position: 'fixed', width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        top: '-200px', left: '-200px', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
        bottom: '-150px', right: '-100px', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 20px 60px rgba(99,102,241,0.35)'
          }}>
            <GraduationCap size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Student Login
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Access your placement dashboard
          </p>
        </div>

        {/* Form card */}
        <div className="glass-card" style={{ padding: '32px' }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
              display: 'flex', alignItems: 'flex-start', gap: '10px'
            }}>
              <AlertCircle size={16} color="#f87171" style={{ marginTop: '1px', flexShrink: 0 }} />
              <span style={{ color: '#f87171', fontSize: '13px' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="form-label">College Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  id="student-email"
                  type="email" required autoComplete="email"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  id="student-password"
                  type={showPass ? 'text' : 'password'} required
                  className="form-input"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <Link to="/forgot-password" style={{ color: 'var(--accent-indigo)', fontSize: '13px', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <button id="student-login-btn" type="submit" className="btn-primary" disabled={loading}
              style={{ justifyContent: 'center', width: '100%', padding: '14px' }}>
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 12px' }}>
              Don't have an account?
            </p>
            <Link to="/register" style={{ color: 'var(--accent-indigo)', fontWeight: '600', fontSize: '13px', textDecoration: 'none' }}>
              Create Student Account →
            </Link>
          </div>
        </div>

        {/* TPO Portal link */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login/tpo" style={{ color: 'var(--text-secondary)', fontSize: '12px', textDecoration: 'none' }}>
            Are you a TPO? <span style={{ color: 'var(--accent-purple)' }}>Admin Portal →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
