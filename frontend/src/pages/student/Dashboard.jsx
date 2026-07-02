import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import {
  Building2, Calendar, DollarSign, Users, ChevronRight,
  CheckCircle, XCircle, AlertTriangle, Loader2, Search, Filter
} from 'lucide-react';

const statusColors = {
  APPLIED: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', border: 'rgba(99,102,241,0.3)', label: 'Applied' },
  SHORTLISTED_TEST: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)', label: 'Test Round' },
  INTERVIEWING: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)', label: 'Interviewing' },
  SELECTED: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', border: 'rgba(34,197,94,0.3)', label: 'Selected ✓' },
  REJECTED: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)', label: 'Not Selected' },
};

function DriveCard({ drive, onApply, applying }) {
  const [expanded, setExpanded] = useState(false);
  const eligible = drive.is_eligible;
  const applied = drive.has_applied;

  return (
    <div className="glass-card" style={{ padding: '24px', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Building2 size={20} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {drive.company_name}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{drive.job_profile}</p>
          </div>
        </div>

        {applied ? (
          <span className="status-badge" style={{ background: statusColors.APPLIED.bg, color: statusColors.APPLIED.text, border: `1px solid ${statusColors.APPLIED.border}` }}>
            <CheckCircle size={12} /> Applied
          </span>
        ) : eligible ? (
          <span className="status-badge" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle size={12} /> Eligible
          </span>
        ) : (
          <span className="status-badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
            <XCircle size={12} /> Not Eligible
          </span>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { icon: DollarSign, label: 'CTC', value: `₹${drive.ctc} LPA` },
          { icon: Users, label: 'Vacancies', value: drive.vacancies },
          { icon: Calendar, label: 'Visit Date', value: new Date(drive.visit_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Icon size={12} style={{ color: 'var(--accent-indigo)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Eligibility cutoffs */}
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <span>Min CGPA: <strong style={{ color: 'var(--text-primary)' }}>{drive.min_cgpa}</strong></span>
        <span>Max Backlogs: <strong style={{ color: 'var(--text-primary)' }}>{drive.max_backlogs}</strong></span>
        <span>Branches: <strong style={{ color: 'var(--text-primary)' }}>{Array.isArray(drive.allowed_branches) && drive.allowed_branches.includes('ALL') ? 'All' : drive.allowed_branches?.join(', ')}</strong></span>
      </div>

      {/* Ineligibility reasons */}
      {!eligible && drive.ineligibility_reasons?.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.08)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
          {drive.ineligibility_reasons.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '12px', marginBottom: i < drive.ineligibility_reasons.length - 1 ? '4px' : 0 }}>
              <AlertTriangle size={12} />
              {r}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={() => !applied && eligible && onApply(drive.id)}
          disabled={!eligible || applied || applying === drive.id}
          className="btn-primary"
          style={{
            flex: 1, justifyContent: 'center', padding: '10px',
            background: !eligible ? 'rgba(255,255,255,0.05)' : applied ? 'rgba(34,197,94,0.2)' : 'var(--gradient)',
            color: !eligible ? 'var(--text-secondary)' : applied ? '#4ade80' : 'white',
            cursor: !eligible || applied ? 'not-allowed' : 'pointer',
            opacity: 1
          }}
        >
          {applying === drive.id ? <><Loader2 size={14} className="animate-spin" /> Applying...</> :
            applied ? <><CheckCircle size={14} /> Applied</> :
              !eligible ? <><XCircle size={14} /> Not Eligible</> : 'Apply Now'}
        </button>
        <button onClick={() => setExpanded(!expanded)} className="btn-secondary" style={{ padding: '10px 12px' }}>
          <ChevronRight size={16} style={{ transform: expanded ? 'rotate(90deg)' : '', transition: '0.2s' }} />
        </button>
      </div>

      {/* Expanded details */}
      {expanded && drive.job_description && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6', margin: '0 0 12px' }}>
            {drive.job_description}
          </p>
          {drive.selection_steps_list?.length > 0 && (
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selection Process</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {drive.selection_steps_list.map((step, i) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                    {i + 1}. {step}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentDashboard() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/student/feed/')
      .then(r => setDrives(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (driveId) => {
    setApplying(driveId);
    try {
      await api.post(`/student/apply/${driveId}/`);
      setDrives(prev => prev.map(d => d.id === driveId ? { ...d, has_applied: true } : d));
    } catch (err) {
      alert(err.response?.data?.error || 'Application failed.');
    } finally {
      setApplying(null);
    }
  };

  const filtered = drives.filter(d =>
    d.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.job_profile?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Job Board
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          Active campus drives — your eligibility is automatically checked
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Drives', value: drives.length, color: '#6366f1' },
          { label: 'Eligible', value: drives.filter(d => d.is_eligible).length, color: '#4ade80' },
          { label: 'Applied', value: drives.filter(d => d.has_applied).length, color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card" style={{ padding: '18px 22px' }}>
            <div style={{ fontSize: '26px', fontWeight: '700', color, marginBottom: '2px' }}>{value}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
        <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input className="form-input" style={{ paddingLeft: '40px' }}
          placeholder="Search companies or roles..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Drive cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} color="var(--accent-indigo)" className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Building2 size={40} style={{ margin: '0 auto 16px', color: 'var(--text-secondary)' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
            {drives.length === 0 ? 'No active campus drives at the moment.' : 'No drives match your search.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '20px' }}>
          {filtered.map(drive => (
            <DriveCard key={drive.id} drive={drive} onApply={handleApply} applying={applying} />
          ))}
        </div>
      )}
    </Layout>
  );
}
