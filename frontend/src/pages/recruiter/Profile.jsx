import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import {
  Building2, Globe, Mail, Phone, User, Save, Edit3, CheckCircle, AlertCircle, Loader2, X
} from 'lucide-react';

export default function RecruiterProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/profile/recruiter/')
      .then(r => { setProfile(r.data); setForm(r.data); })
      .catch(() => setError('Failed to load company profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setMessage(''); setError('');
    try {
      const { data } = await api.patch('/auth/profile/recruiter/', {
        company_name: form.company_name,
        company_website: form.company_website,
        company_description: form.company_description,
        hr_contact_name: form.hr_contact_name,
        hr_contact_email: form.hr_contact_email,
        hr_contact_phone: form.hr_contact_phone,
      });
      setProfile(data);
      setEditing(false);
      setMessage('Company profile updated successfully.');
      setTimeout(() => setMessage(''), 4000);
    } catch {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <Loader2 size={32} color="var(--accent-indigo)" className="animate-spin" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>Company Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Manage your company presence and HR contact details</p>
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

      {message && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '8px', color: '#4ade80', fontSize: '13px' }}>
          <CheckCircle size={16} /> {message}
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '8px', color: '#f87171', fontSize: '13px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Approval Status Banner */}
      <div style={{
        background: profile?.is_approved ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
        border: `1px solid ${profile?.is_approved ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
        borderRadius: '12px', padding: '14px 18px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        {profile?.is_approved
          ? <CheckCircle size={18} color="#4ade80" />
          : <span style={{ fontSize: '18px' }}>⏳</span>}
        <div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: profile?.is_approved ? '#4ade80' : '#fbbf24' }}>
            {profile?.is_approved ? 'Account Approved by TPO' : 'Pending TPO Approval'}
          </span>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {profile?.is_approved ? 'Your account is active and drives are visible to students.' : 'Your account is under review. Contact the TPO office if delayed.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Company Info */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building2 size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {profile?.company_name || 'Your Company'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Company profile</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label"><Building2 size={11} style={{ display: 'inline', marginRight: '4px' }} />Company Name</label>
              {editing ? (
                <input className="form-input" value={form.company_name || ''} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} placeholder="Company name" />
              ) : (
                <div style={{ padding: '8px 0', color: 'var(--text-primary)', fontSize: '14px' }}>{profile?.company_name || <span style={{ color: 'var(--text-secondary)' }}>Not set</span>}</div>
              )}
            </div>
            <div>
              <label className="form-label"><Globe size={11} style={{ display: 'inline', marginRight: '4px' }} />Company Website</label>
              {editing ? (
                <input className="form-input" type="url" value={form.company_website || ''} onChange={e => setForm(p => ({ ...p, company_website: e.target.value }))} placeholder="https://company.com" />
              ) : (
                <div style={{ padding: '8px 0', fontSize: '14px' }}>
                  {profile?.company_website ? <a href={profile.company_website} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-indigo)' }}>{profile.company_website}</a> : <span style={{ color: 'var(--text-secondary)' }}>Not set</span>}
                </div>
              )}
            </div>
            <div>
              <label className="form-label">Company Description</label>
              {editing ? (
                <textarea className="form-input" rows={4} value={form.company_description || ''} onChange={e => setForm(p => ({ ...p, company_description: e.target.value }))} placeholder="Describe your company..." style={{ resize: 'vertical', lineHeight: '1.5' }} />
              ) : (
                <div style={{ padding: '8px 0', color: profile?.company_description ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                  {profile?.company_description || 'No description added.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HR Contact */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} color="var(--accent-indigo)" /> HR Point of Contact
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">HR Contact Name</label>
              {editing ? (
                <input className="form-input" value={form.hr_contact_name || ''} onChange={e => setForm(p => ({ ...p, hr_contact_name: e.target.value }))} placeholder="Jane Smith" />
              ) : (
                <div style={{ padding: '8px 0', color: 'var(--text-primary)', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <User size={13} color="var(--accent-indigo)" />
                  {profile?.hr_contact_name || <span style={{ color: 'var(--text-secondary)' }}>Not set</span>}
                </div>
              )}
            </div>
            <div>
              <label className="form-label"><Mail size={11} style={{ display: 'inline', marginRight: '4px' }} />HR Email</label>
              {editing ? (
                <input className="form-input" type="email" value={form.hr_contact_email || ''} onChange={e => setForm(p => ({ ...p, hr_contact_email: e.target.value }))} placeholder="hr@company.com" />
              ) : (
                <div style={{ padding: '8px 0', fontSize: '14px', color: profile?.hr_contact_email ? 'var(--accent-indigo)' : 'var(--text-secondary)' }}>
                  {profile?.hr_contact_email || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="form-label"><Phone size={11} style={{ display: 'inline', marginRight: '4px' }} />HR Phone</label>
              {editing ? (
                <input className="form-input" type="tel" value={form.hr_contact_phone || ''} onChange={e => setForm(p => ({ ...p, hr_contact_phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
              ) : (
                <div style={{ padding: '8px 0', color: 'var(--text-primary)', fontSize: '14px' }}>
                  {profile?.hr_contact_phone || <span style={{ color: 'var(--text-secondary)' }}>Not set</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
