import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, User, Mail, Lock, Hash, BookOpen, Calendar, Star, AlertCircle, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const BRANCHES = [
  { value: 'CSE', label: 'Computer Science' },
  { value: 'IT', label: 'Information Technology' },
  { value: 'ECE', label: 'Electronics & Communication' },
  { value: 'EEE', label: 'Electrical & Electronics' },
  { value: 'ME', label: 'Mechanical Engineering' },
  { value: 'CE', label: 'Civil Engineering' },
  { value: 'CH', label: 'Chemical Engineering' },
  { value: 'OTHER', label: 'Other' },
];

export default function Register() {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', roll_number: '', branch: 'CSE',
    graduation_year: new Date().getFullYear() + 1, cgpa: '', password: '', confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    // Client-side validation
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Name is required';
    if (form.password !== form.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    if (parseFloat(form.cgpa) < 0 || parseFloat(form.cgpa) > 10) newErrors.cgpa = 'CGPA must be 0–10';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await registerStudent(form);
      setSuccess(true);
      setTimeout(() => navigate('/student/dashboard'), 1500);
    } catch (err) {
      const data = err.response?.data || {};
      if (typeof data === 'object') {
        const mapped = {};
        Object.entries(data).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputProps = (name) => ({
    id: `reg-${name}`, name, value: form[name], onChange: handleChange,
    className: 'form-input', style: errors[name] ? { borderColor: '#f87171' } : {}
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '24px'
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 20% 10%, rgba(99,102,241,0.08) 0%, transparent 60%)'
      }} />

      <div style={{ width: '100%', maxWidth: '520px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 16px 50px rgba(99,102,241,0.3)'
          }}>
            <GraduationCap size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px' }}>Create Student Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Join the placement portal</p>
        </div>

        {success && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '12px', padding: '14px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '10px', color: '#4ade80'
          }}>
            <CheckCircle size={18} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Account created! Redirecting to dashboard...</span>
          </div>
        )}

        <div className="glass-card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Name + Roll */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input {...inputProps('full_name')} type="text" required placeholder="John Doe" style={{ paddingLeft: '38px', ...(errors.full_name ? { borderColor: '#f87171' } : {}) }} />
                </div>
                {errors.full_name && <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>{errors.full_name}</p>}
              </div>
              <div>
                <label className="form-label">Roll Number *</label>
                <div style={{ position: 'relative' }}>
                  <Hash size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input {...inputProps('roll_number')} type="text" required placeholder="20CSE001" style={{ paddingLeft: '38px', ...(errors.roll_number ? { borderColor: '#f87171' } : {}) }} />
                </div>
                {errors.roll_number && <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>{errors.roll_number}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="form-label">College Email *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input {...inputProps('email')} type="email" required placeholder="you@college.edu" style={{ paddingLeft: '38px', ...(errors.email ? { borderColor: '#f87171' } : {}) }} />
              </div>
              {errors.email && <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>{errors.email}</p>}
            </div>

            {/* Branch + Grad Year */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Branch *</label>
                <select {...inputProps('branch')} required style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}>
                  {BRANCHES.map(b => <option key={b.value} value={b.value} style={{ background: '#1a1f35' }}>{b.label}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Graduation Year *</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input {...inputProps('graduation_year')} type="number" required min="2020" max="2035" style={{ paddingLeft: '38px' }} />
                </div>
              </div>
            </div>

            {/* CGPA */}
            <div>
              <label className="form-label">CGPA (0–10) *</label>
              <div style={{ position: 'relative' }}>
                <Star size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input {...inputProps('cgpa')} type="number" step="0.01" min="0" max="10" required placeholder="8.5" style={{ paddingLeft: '38px', ...(errors.cgpa ? { borderColor: '#f87171' } : {}) }} />
              </div>
              {errors.cgpa && <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>{errors.cgpa}</p>}
            </div>

            {/* Password + Confirm */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input {...inputProps('password')} type={showPass ? 'text' : 'password'} required minLength={8} placeholder="Min 8 chars" style={{ paddingLeft: '38px', paddingRight: '36px' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0 }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input {...inputProps('confirm_password')} type={showPass ? 'text' : 'password'} required placeholder="Repeat password" style={{ paddingLeft: '38px', ...(errors.confirm_password ? { borderColor: '#f87171' } : {}) }} />
                </div>
                {errors.confirm_password && <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>{errors.confirm_password}</p>}
              </div>
            </div>

            {errors.non_field_errors && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertCircle size={14} color="#f87171" />
                <span style={{ color: '#f87171', fontSize: '13px' }}>{errors.non_field_errors}</span>
              </div>
            )}

            <button id="register-btn" type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', padding: '14px', marginTop: '4px' }}>
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login/student" style={{ color: 'var(--text-secondary)', fontSize: '13px', textDecoration: 'none' }}>
            Already have an account? <span style={{ color: 'var(--accent-indigo)' }}>Sign in →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
