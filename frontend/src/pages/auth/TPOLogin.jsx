import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export default function TPOLogin() {
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
      if (user.role !== 'TPO') {
        setError('This portal is for TPO administrators only.');
        return;
      }
      navigate('/tpo/dashboard');
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
      <div style={{
        position: 'fixed', width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)',
        top: '-200px', right: '-200px', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 20px 60px rgba(139,92,246,0.35)'
          }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>
            TPO Admin Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Placement command center
          </p>
        </div>

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
              <label className="form-label">Admin Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input id="tpo-email" type="email" required className="form-input" style={{ paddingLeft: '42px' }}
                  placeholder="admin@college.edu" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input id="tpo-password" type={showPass ? 'text' : 'password'} required
                  className="form-input" style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="tpo-login-btn" type="submit" disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: 'white',
                fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}>
              {loading ? 'Authenticating...' : <><span>Access Command Center</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
              Default: tpo@college.edu / Admin@123
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login/student" style={{ color: 'var(--text-secondary)', fontSize: '12px', textDecoration: 'none' }}>
            ← Back to Student Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
