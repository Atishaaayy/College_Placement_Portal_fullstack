import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Hash, BookOpen, Calendar, Star, Phone, Link,
  Upload, FileText, CheckCircle, AlertCircle, Loader2, Edit3, Save, X
} from 'lucide-react';

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

const statusConfig = {
  PENDING: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)', label: 'Pending Verification' },
  VERIFIED: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', border: 'rgba(34,197,94,0.3)', label: 'Verified ✓' },
};

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/auth/profile/student/')
      .then(r => { setProfile(r.data); setForm(r.data); })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null); setError(null);
    try {
      const { data } = await api.patch('/auth/profile/student/', {
        about: form.about,
        phone: form.phone,
        linkedin_url: form.linkedin_url,
        github_url: form.github_url,
        active_backlogs: form.active_backlogs,
      });
      setProfile(data);
      setEditing(false);
      setMessage('Profile updated successfully.');
    } catch {
      setError('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.pdf')) { setError('Only PDF files are accepted.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5MB.'); return; }

    setUploadingResume(true);
    setMessage(null); setError(null);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const { data } = await api.post('/auth/profile/student/resume/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, resume: data.resume_url }));
      setMessage('Resume uploaded successfully!');
    } catch {
      setError('Resume upload failed. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <Loader2 size={32} color="var(--accent-indigo)" className="animate-spin" />
      </div>
    </Layout>
  );

  const vs = statusConfig[profile?.verification_status] || statusConfig.PENDING;

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>My Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Manage your academic details and resume</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {editing ? (
            <>
              <button className="btn-secondary" onClick={() => { setEditing(false); setForm(profile); }} style={{ padding: '8px 16px' }}>
                <X size={14} /> Cancel
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '8px 16px' }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => setEditing(true)} style={{ padding: '8px 16px' }}>
              <Edit3 size={14} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '8px', color: '#4ade80' }}>
          <CheckCircle size={16} /> <span style={{ fontSize: '13px' }}>{message}</span>
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '8px', color: '#f87171' }}>
          <AlertCircle size={16} /> <span style={{ fontSize: '13px' }}>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: Academic Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Identity card */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '18px', flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(99,102,241,0.3)'
              }}>
                <User size={28} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{user?.full_name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{user?.email}</div>
                <span className="status-badge" style={{ marginTop: '8px', background: vs.bg, color: vs.color, border: `1px solid ${vs.border}` }}>
                  {vs.label}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { icon: Hash, label: 'Roll Number', value: profile?.roll_number },
                { icon: BookOpen, label: 'Branch', value: BRANCHES.find(b => b.value === profile?.branch)?.label || profile?.branch },
                { icon: Calendar, label: 'Graduation Year', value: profile?.graduation_year },
                { icon: Star, label: 'CGPA', value: profile?.cgpa },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Icon size={12} color="var(--accent-indigo)" />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{value || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Editable fields */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 20px' }}>Additional Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label"><Phone size={12} style={{ display: 'inline', marginRight: '5px' }} />Phone Number</label>
                {editing ? (
                  <input className="form-input" value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                ) : (
                  <div style={{ color: 'var(--text-primary)', fontSize: '14px', padding: '8px 0' }}>{profile?.phone || <span style={{ color: 'var(--text-secondary)' }}>Not set</span>}</div>
                )}
              </div>
              <div>
                <label className="form-label">Active Backlogs</label>
                {editing ? (
                  <input className="form-input" type="number" min="0" value={form.active_backlogs ?? 0} onChange={e => setForm(p => ({ ...p, active_backlogs: parseInt(e.target.value) || 0 }))} />
                ) : (
                  <div style={{ color: 'var(--text-primary)', fontSize: '14px', padding: '8px 0' }}>{profile?.active_backlogs ?? 0}</div>
                )}
              </div>
              <div>
                <label className="form-label"><Link size={12} style={{ display: 'inline', marginRight: '5px' }} />LinkedIn URL</label>
                {editing ? (
                  <input className="form-input" value={form.linkedin_url || ''} onChange={e => setForm(p => ({ ...p, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/..." />
                ) : (
                  <div style={{ fontSize: '14px', padding: '8px 0' }}>
                    {profile?.linkedin_url ? <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-indigo)', textDecoration: 'none' }}>{profile.linkedin_url}</a> : <span style={{ color: 'var(--text-secondary)' }}>Not set</span>}
                  </div>
                )}
              </div>
              <div>
                <label className="form-label"><Link size={12} style={{ display: 'inline', marginRight: '5px' }} />GitHub URL</label>
                {editing ? (
                  <input className="form-input" value={form.github_url || ''} onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))} placeholder="https://github.com/..." />
                ) : (
                  <div style={{ fontSize: '14px', padding: '8px 0' }}>
                    {profile?.github_url ? <a href={profile.github_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-indigo)', textDecoration: 'none' }}>{profile.github_url}</a> : <span style={{ color: 'var(--text-secondary)' }}>Not set</span>}
                  </div>
                )}
              </div>
              <div>
                <label className="form-label">About Me</label>
                {editing ? (
                  <textarea className="form-input" rows={3} value={form.about || ''} onChange={e => setForm(p => ({ ...p, about: e.target.value }))} placeholder="Tell recruiters about yourself..." style={{ resize: 'vertical', lineHeight: '1.5' }} />
                ) : (
                  <div style={{ color: profile?.about ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', padding: '8px 0' }}>
                    {profile?.about || 'No bio added yet.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Resume */}
        <div>
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 20px' }}>Resume</h3>

            {profile?.resume ? (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: '12px', padding: '18px', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} color="#818cf8" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Resume Uploaded</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>PDF document</div>
                  </div>
                  <a href={profile.resume} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>View</a>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '32px', border: '2px dashed var(--border)', textAlign: 'center', marginBottom: '20px' }}>
                <FileText size={32} style={{ margin: '0 auto 12px', color: 'var(--text-secondary)' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>No resume uploaded yet</p>
              </div>
            )}

            <label htmlFor="resume-upload" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: '10px', border: '1px solid var(--border)',
              cursor: uploadingResume ? 'not-allowed' : 'pointer', fontSize: '14px',
              fontWeight: '500', color: 'var(--text-primary)', transition: 'all 0.2s',
              background: 'rgba(255,255,255,0.03)', opacity: uploadingResume ? 0.6 : 1
            }}>
              {uploadingResume ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploadingResume ? 'Uploading...' : profile?.resume ? 'Replace Resume' : 'Upload Resume (PDF)'}
            </label>
            <input id="resume-upload" type="file" accept=".pdf" onChange={handleResumeUpload} disabled={uploadingResume} style={{ display: 'none' }} />
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '8px' }}>PDF only, max 5MB</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
