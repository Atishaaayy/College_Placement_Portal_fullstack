import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Bell, Plus, Trash2, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const priorityConfig = {
  LOW: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)', label: 'Low' },
  MEDIUM: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.2)', label: 'Medium' },
  HIGH: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.2)', label: 'High' },
  URGENT: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.2)', label: '🔴 Urgent' },
};

function AnnouncementModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', message: '', priority: 'MEDIUM' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) { setError('Title and message are required.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/tpo/announcements/', form);
      onSaved(data);
    } catch {
      setError('Failed to create announcement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '520px', background: '#0d1426', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Broadcast Announcement</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={18} /></button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', gap: '8px', color: '#f87171', fontSize: '12px' }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Title *</label>
            <input className="form-input" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Google Campus Drive – Date Change" />
          </div>
          <div>
            <label className="form-label">Message *</label>
            <textarea className="form-input" rows={4} required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Write your announcement here..." style={{ resize: 'vertical', lineHeight: '1.5' }} />
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: '10px' }}>Priority</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {PRIORITIES.map(p => {
                const pc = priorityConfig[p];
                const active = form.priority === p;
                return (
                  <button key={p} type="button" onClick={() => setForm(f => ({ ...f, priority: p }))} style={{
                    flex: 1, padding: '8px 4px', borderRadius: '8px', border: `1px solid ${active ? pc.border : 'var(--border)'}`,
                    background: active ? pc.bg : 'transparent', color: active ? pc.color : 'var(--text-secondary)',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s'
                  }}>{pc.label}</button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
              {loading ? <><Loader2 size={14} className="animate-spin" /> Broadcasting...</> : <><Bell size={14} /> Broadcast Now</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TPOAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/tpo/announcements/').then(r => setAnnouncements(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSaved = (data) => {
    setAnnouncements(prev => [data, ...prev]);
    setShowModal(false);
    setMessage('Announcement broadcast to all students!');
    setTimeout(() => setMessage(''), 4000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    setDeleting(id);
    try {
      await api.delete(`/tpo/announcements/${id}/`);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch {
      setMessage('Failed to delete.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Layout>
      {showModal && <AnnouncementModal onClose={() => setShowModal(false)} onSaved={handleSaved} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>Campus Broadcast</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Send global notifications to all students</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Announcement
        </button>
      </div>

      {message && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '8px', color: '#4ade80', fontSize: '13px' }}>
          <CheckCircle size={16} /> {message}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} color="var(--accent-indigo)" className="animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Bell size={40} style={{ margin: '0 auto 16px', color: 'var(--text-secondary)' }} />
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px' }}>No announcements posted yet.</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Create First Announcement</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {announcements.map(a => {
            const pc = priorityConfig[a.priority] || priorityConfig.MEDIUM;
            return (
              <div key={a.id} className="glass-card" style={{ padding: '22px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: pc.bg, border: `1px solid ${pc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bell size={20} color={pc.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{a.title}</span>
                    <span className="status-badge" style={{ background: pc.bg, color: pc.color, border: `1px solid ${pc.border}`, fontSize: '10px' }}>{pc.label}</span>
                    {!a.is_active && <span style={{ fontSize: '11px', color: '#f87171' }}>Inactive</span>}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 8px', lineHeight: '1.6' }}>{a.message}</p>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Posted {new Date(a.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <button onClick={() => handleDelete(a.id)} disabled={deleting === a.id} className="btn-danger" style={{ padding: '6px 10px', flexShrink: 0 }}>
                  {deleting === a.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
