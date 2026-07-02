import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import {
  Users, Building2, FileText, Loader2, Search, ExternalLink, CheckCircle, XCircle, Clock, ChevronDown
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'APPLIED', label: 'Applied', color: '#818cf8' },
  { value: 'SHORTLISTED_TEST', label: 'Shortlisted – Test', color: '#fbbf24' },
  { value: 'INTERVIEWING', label: 'Interviewing', color: '#60a5fa' },
  { value: 'SELECTED', label: 'Selected', color: '#4ade80' },
  { value: 'REJECTED', label: 'Rejected', color: '#f87171' },
];

const statusConfig = {
  APPLIED: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
  SHORTLISTED_TEST: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  INTERVIEWING: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  SELECTED: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.25)' },
  REJECTED: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.25)' },
};

function StatusDropdown({ applicationId, currentStatus, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleSelect = async (newStatus) => {
    if (newStatus === currentStatus) { setOpen(false); return; }
    setUpdating(true);
    setOpen(false);
    try {
      await api.patch(`/recruiter/applications/${applicationId}/status/`, { status: newStatus });
      onUpdate(applicationId, newStatus);
    } catch {
      alert('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const sc = statusConfig[currentStatus] || statusConfig.APPLIED;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        disabled={updating}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px',
          borderRadius: '8px', border: `1px solid ${sc.border}`, background: sc.bg,
          color: sc.color, fontSize: '11px', fontWeight: '600', cursor: 'pointer',
          opacity: updating ? 0.7 : 1, transition: 'all 0.15s'
        }}>
        {updating ? <Loader2 size={10} className="animate-spin" /> : null}
        {STATUS_OPTIONS.find(s => s.value === currentStatus)?.label || currentStatus}
        <ChevronDown size={10} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 50,
            background: '#0d1426', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', overflow: 'hidden', minWidth: '170px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)'
          }}>
            {STATUS_OPTIONS.map(opt => {
              const osc = statusConfig[opt.value];
              return (
                <button key={opt.value} onClick={() => handleSelect(opt.value)} style={{
                  display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                  background: currentStatus === opt.value ? osc.bg : 'transparent',
                  border: 'none', color: currentStatus === opt.value ? osc.color : 'var(--text-secondary)',
                  fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                  transition: 'all 0.1s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = osc.bg}
                  onMouseLeave={e => e.currentTarget.style.background = currentStatus === opt.value ? osc.bg : 'transparent'}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function RecruiterApplicants() {
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/recruiter/drives/').then(r => {
      setDrives(r.data);
      if (r.data.length > 0) loadApplicants(r.data[0]);
    }).finally(() => setLoading(false));
  }, []);

  const loadApplicants = async (drive) => {
    setSelectedDrive(drive);
    setLoadingApplicants(true);
    try {
      const { data } = await api.get(`/recruiter/drives/${drive.id}/applicants/`);
      setApplicants(data);
    } catch {
      setApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleStatusUpdate = (appId, newStatus) => {
    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
  };

  const filtered = applicants.filter(a =>
    !search ||
    a.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.student_email?.toLowerCase().includes(search.toLowerCase()) ||
    a.student_roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <Loader2 size={32} color="var(--accent-indigo)" className="animate-spin" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>Applicant Screening Board</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Review candidates and update their application status</p>
      </div>

      {drives.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Building2 size={40} style={{ margin: '0 auto 16px', color: 'var(--text-secondary)' }} />
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No drives found for your company. Contact the TPO to create drives.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
          {/* Drive selector */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Select Drive</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {drives.map(drive => {
                const isSelected = selectedDrive?.id === drive.id;
                return (
                  <button key={drive.id} onClick={() => loadApplicants(drive)} style={{
                    padding: '14px', borderRadius: '12px', border: `1px solid ${isSelected ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                    background: isSelected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                    color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: isSelected ? '#818cf8' : 'var(--text-primary)', marginBottom: '4px' }}>{drive.job_profile}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {new Date(drive.visit_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Applicants */}
          <div>
            {selectedDrive && (
              <>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, position: 'relative', maxWidth: '320px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input className="form-input" style={{ paddingLeft: '36px' }} placeholder="Search applicants..."
                      value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{filtered.length} applicants</span>
                </div>

                {loadingApplicants ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Loader2 size={28} color="var(--accent-indigo)" className="animate-spin" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <Users size={32} style={{ margin: '0 auto 12px', color: 'var(--text-secondary)' }} />
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
                      {applicants.length === 0 ? 'No applicants yet for this drive.' : 'No applicants match your search.'}
                    </p>
                  </div>
                ) : (
                  <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 130px', gap: '12px', padding: '12px 18px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                      {['Student', 'Roll No', 'Branch', 'CGPA', 'Applied', 'Status'].map(h => (
                        <div key={h} style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                      ))}
                    </div>
                    {filtered.map((app, i) => {
                      const sp = app.student_profile || {};
                      return (
                        <div key={app.id} style={{
                          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 130px',
                          gap: '12px', padding: '14px 18px', alignItems: 'center',
                          borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                          transition: 'background 0.1s'
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{app.student_name}</div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.student_email}</span>
                              {sp.resume && (
                                <a href={sp.resume} target="_blank" rel="noreferrer" title="View Resume" style={{ color: '#818cf8', flexShrink: 0 }}>
                                  <FileText size={12} />
                                </a>
                              )}
                              {sp.linkedin_url && (
                                <a href={sp.linkedin_url} target="_blank" rel="noreferrer" title="LinkedIn" style={{ color: '#60a5fa', flexShrink: 0 }}>
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{sp.roll_number || '—'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{sp.branch || '—'}</div>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{sp.cgpa || '—'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {new Date(app.applied_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </div>
                          <StatusDropdown applicationId={app.id} currentStatus={app.status} onUpdate={handleStatusUpdate} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
