import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Mail, KeyRound, ArrowLeft, CheckCircle, AlertCircle, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password/', { email });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 16px 50px rgba(59,130,246,0.3)'
          }}>
            <KeyRound size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Reset Password
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            We'll send a reset link to your email
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle size={40} color="#4ade80" style={{ margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Check your email</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
                If an account exists for <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>,
                a password reset link has been dispatched.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '16px' }}>
                (Development mode: Check Django console for the token)
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AlertCircle size={15} color="#f87171" />
                  <span style={{ color: '#f87171', fontSize: '13px' }}>{error}</span>
                </div>
              )}
              <div>
                <label className="form-label">Registered Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input id="forgot-email" type="email" required className="form-input" style={{ paddingLeft: '40px' }}
                    placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}
                style={{ justifyContent: 'center', padding: '14px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                {loading ? 'Sending...' : <><Send size={15} /><span>Send Reset Link</span></>}
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login/student" style={{ color: 'var(--text-secondary)', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
