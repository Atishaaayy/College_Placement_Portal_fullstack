import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import {
  Plus, Building2, Calendar, DollarSign, Users, Edit3, Trash2, Download,
  X, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'CH', 'OTHER', 'ALL'];

const INITIAL_FORM = {
  company_name: '', job_profile: '', job_description: '', selection_steps: '',
  ctc: '', vacancies: 1, visit_date: '', last_apply_date: '',
  min_cgpa: 0, allowed_branches: ['ALL'], max_backlogs: 0, min_graduation_year: '', is_active: true
};

function DriveFormModal({ drive, onClose, onSaved }) {
  const isEdit = !!drive;
  const [form, setForm] = useState(isEdit ? {
    ...drive,
    company_name: drive.company_name || '',
    allowed_branches: drive.allowed_branches || ['ALL'],
  } : { ...INITIAL_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleBranch = (b) => {
    setForm(p => {
      if (b === 'ALL') return { ...p, allowed_branches: ['ALL'] };
      const curr = p.allowed_branches.filter(x => x !== 'ALL');
      return curr.includes(b)
        ? { ...p, allowed_branches: curr.filter(x => x !== b) || ['ALL'] }
        : { ...p, allowed_branches: [...curr, b] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        allowed_branches: form.allowed_branches.length ? form.allowed_branches : ['ALL'],
        min_graduation_year: form.min_graduation_year || null,
        last_apply_date: form.last_apply_date || null,
      };
      if (isEdit) {
        const { data } = await api.patch(`/tpo/drives/${drive.id}/`, payload);
        onSaved(data, 'edit');
      } else {
        const { data } = await api.post('/tpo/drives/', payload);
        onSaved(data, 'create');
      }
    } catch (err) {
      const errs = err.response?.data;
      if (errs && typeof errs === 'object') {
        const msgs = Object.entries(errs).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join('; ');
        setError(msgs);
      } else {
        setError('Failed to save drive. Please check all fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflow: 'auto', background: '#0d1426', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            {isEdit ? 'Edit Campus Drive' : 'Post New Campus Drive'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', gap: '8px', color: '#f87171', fontSize: '13px' }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Company Name *</label>
              <input className="form-input" required value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} placeholder="Google, Infosys, etc." />
            </div>
            <div>
              <label className="form-label">Job Profile *</label>
              <input className="form-input" required value={form.job_profile} onChange={e => setForm(p => ({ ...p, job_profile: e.target.value }))} placeholder="Software Engineer" />
            </div>
          </div>

          <div>
            <label className="form-label">Job Description</label>
            <textarea className="form-input" rows={2} value={form.job_description} onChange={e => setForm(p => ({ ...p, job_description: e.target.value }))} placeholder="Role responsibilities..." style={{ resize: 'vertical' }} />
          </div>

          <div>
            <label className="form-label">Selection Steps *</label>
            <input className="form-input" required value={form.selection_steps} onChange={e => setForm(p => ({ ...p, selection_steps: e.target.value }))} placeholder="Aptitude Test, Technical Interview, HR Round" />
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Comma-separated steps</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <label className="form-label">CTC (LPA) *</label>
              <input className="form-input" type="number" step="0.1" min="0" required value={form.ctc} onChange={e => setForm(p => ({ ...p, ctc: e.target.value }))} placeholder="12.5" />
            </div>
            <div>
              <label className="form-label">Vacancies *</label>
              <input className="form-input" type="number" min="1" required value={form.vacancies} onChange={e => setForm(p => ({ ...p, vacancies: parseInt(e.target.value) || 1 }))} />
            </div>
            <div>
              <label className="form-label">Max Backlogs</label>
              <input className="form-input" type="number" min="0" value={form.max_backlogs} onChange={e => setForm(p => ({ ...p, max_backlogs: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Campus Visit Date *</label>
              <input className="form-input" type="date" required value={form.visit_date} onChange={e => setForm(p => ({ ...p, visit_date: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Last Apply Date</label>
              <input className="form-input" type="date" value={form.last_apply_date || ''} onChange={e => setForm(p => ({ ...p, last_apply_date: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Min CGPA Cutoff</label>
              <input className="form-input" type="number" step="0.01" min="0" max="10" value={form.min_cgpa} onChange={e => setForm(p => ({ ...p, min_cgpa: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Min Graduation Year</label>
              <input className="form-input" type="number" min="2020" max="2035" value={form.min_graduation_year || ''} onChange={e => setForm(p => ({ ...p, min_graduation_year: e.target.value }))} placeholder="Optional" />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: '10px' }}>Allowed Branches</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {BRANCHES.map(b => {
                const selected = form.allowed_branches.includes(b);
                return (
                  <button key={b} type="button" onClick={() => toggleBranch(b)} style={{
                    padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '500',
                    border: `1px solid ${selected ? 'rgba(99,102,241,0.5)' : 'var(--border)'}`,
                    background: selected ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: selected ? '#818cf8' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s'
                  }}>{b}</button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#6366f1' }} />
            <label htmlFor="is_active" style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>Drive is Active (visible to students)</label>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
              {loading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : isEdit ? 'Update Drive' : 'Post Drive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TPODrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalDrive, setModalDrive] = useState(undefined); // undefined = closed, null = new, obj = edit
  const [message, setMessage] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.get('/tpo/drives/').then(r => setDrives(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSaved = (data, type) => {
    if (type === 'create') {
      setDrives(prev => [data, ...prev]);
    } else {
      setDrives(prev => prev.map(d => d.id === data.id ? data : d));
    }
    setModalDrive(undefined);
    setMessage(type === 'create' ? 'Drive posted successfully!' : 'Drive updated successfully!');
    setTimeout(() => setMessage(null), 4000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this drive? This action cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/tpo/drives/${id}/`);
      setDrives(prev => prev.filter(d => d.id !== id));
      setMessage('Drive deleted.');
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage('Failed to delete drive.');
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = (driveId, companyName) => {
    const token = localStorage.getItem('access_token');
    const url = `http://127.0.0.1:8000/api/tpo/drives/${driveId}/export/`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName}_applicants.csv`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
  };

  return (
    <Layout>
      {modalDrive !== undefined && (
        <DriveFormModal
          drive={modalDrive}
          onClose={() => setModalDrive(undefined)}
          onSaved={handleSaved}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>Campus Drives</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{drives.length} drive{drives.length !== 1 ? 's' : ''} posted</p>
        </div>
        <button className="btn-primary" onClick={() => setModalDrive(null)}>
          <Plus size={16} /> Post New Drive
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
      ) : drives.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Building2 size={40} style={{ margin: '0 auto 16px', color: 'var(--text-secondary)' }} />
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px' }}>No drives posted yet.</p>
          <button className="btn-primary" onClick={() => setModalDrive(null)}><Plus size={14} /> Post First Drive</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {drives.map(drive => (
            <div key={drive.id} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={22} color="white" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{drive.company_name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{drive.job_profile}</div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <DollarSign size={11} color="var(--accent-indigo)" /> ₹{drive.ctc} LPA
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <Users size={11} color="var(--accent-indigo)" /> {drive.vacancies} vacancies
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <Calendar size={11} color="var(--accent-indigo)" />
                        {new Date(drive.visit_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="status-badge" style={{ fontSize: '10px', background: drive.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', color: drive.is_active ? '#4ade80' : '#f87171', border: `1px solid ${drive.is_active ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)'}` }}>
                        {drive.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
                  <button onClick={() => handleExport(drive.id, drive.company_name)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} title="Export CSV">
                    <Download size={13} />
                  </button>
                  <button onClick={() => setModalDrive(drive)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => handleDelete(drive.id)} disabled={deleting === drive.id} className="btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    {deleting === drive.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                  <button onClick={() => setExpandedId(expandedId === drive.id ? null : drive.id)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                    {expandedId === drive.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                </div>
              </div>

              {expandedId === drive.id && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Eligibility</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.8' }}>
                      Min CGPA: <strong>{drive.min_cgpa}</strong><br />
                      Max Backlogs: <strong>{drive.max_backlogs}</strong><br />
                      Branches: <strong>{Array.isArray(drive.allowed_branches) && drive.allowed_branches.includes('ALL') ? 'All' : drive.allowed_branches?.join(', ')}</strong>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Selection Process</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {drive.selection_steps_list?.map((step, i) => (
                        <span key={i} style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{i + 1}. {step}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Description</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{drive.job_description || 'No description provided.'}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
