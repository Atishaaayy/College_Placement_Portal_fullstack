import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import {
  FileText, Building2, Calendar, DollarSign, CheckCircle, Clock,
  XCircle, Loader2, Award, ChevronRight
} from 'lucide-react';

const statusConfig = {
  APPLIED: {
    bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.3)',
    label: 'Applied', icon: Clock, step: 1
  },
  SHORTLISTED_TEST: {
    bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)',
    label: 'Shortlisted – Test Round', icon: FileText, step: 2
  },
  INTERVIEWING: {
    bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)',
    label: 'Interviewing', icon: ChevronRight, step: 3
  },
  SELECTED: {
    bg: 'rgba(34,197,94,0.15)', color: '#4ade80', border: 'rgba(34,197,94,0.3)',
    label: 'Selected ✓', icon: CheckCircle, step: 4
  },
  REJECTED: {
    bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'rgba(239,68,68,0.3)',
    label: 'Not Selected', icon: XCircle, step: 0
  },
};

const PIPELINE_STEPS = ['Applied', 'Shortlisted – Test', 'Interviewing', 'Selected'];

function PipelineBar({ status }) {
  const currentStep = statusConfig[status]?.step || 0;
  const isRejected = status === 'REJECTED';

  if (isRejected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
        <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: 'rgba(239,68,68,0.4)' }} />
        <span style={{ fontSize: '11px', color: '#f87171', fontWeight: '500', flexShrink: 0 }}>Application Rejected</span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {PIPELINE_STEPS.map((step, i) => (
          <div key={step} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: i < currentStep
              ? (i === 3 ? 'rgba(34,197,94,0.8)' : 'rgba(99,102,241,0.8)')
              : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {PIPELINE_STEPS.map((step, i) => (
          <span key={step} style={{
            fontSize: '10px', color: i < currentStep ? 'var(--text-secondary)' : 'rgba(255,255,255,0.25)',
            fontWeight: i + 1 === currentStep ? '600' : '400'
          }}>{step}</span>
        ))}
      </div>
    </div>
  );
}

function ApplicationCard({ app }) {
  const sc = statusConfig[app.status] || statusConfig.APPLIED;
  const Icon = sc.icon;

  return (
    <div className="glass-card" style={{ padding: '24px', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Building2 size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {app.drive_company_name || app.company_name}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{app.drive_job_profile || app.job_profile}</div>
          </div>
        </div>
        <span className="status-badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
          <Icon size={12} /> {sc.label}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '8px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <DollarSign size={10} color="var(--accent-indigo)" /> CTC
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>₹{app.drive_ctc || app.ctc} LPA</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <Calendar size={10} color="var(--accent-indigo)" /> Applied
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {new Date(app.applied_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <Calendar size={10} color="var(--accent-indigo)" /> Visit Date
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {app.drive_visit_date ? new Date(app.drive_visit_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
          </div>
        </div>
      </div>

      <PipelineBar status={app.status} />

      {app.notes && (
        <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px 12px', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Note:</strong> {app.notes}
        </div>
      )}
    </div>
  );
}

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.get('/student/applications/')
      .then(r => setApplications(r.data))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    ALL: applications.length,
    APPLIED: applications.filter(a => a.status === 'APPLIED').length,
    SHORTLISTED_TEST: applications.filter(a => a.status === 'SHORTLISTED_TEST').length,
    INTERVIEWING: applications.filter(a => a.status === 'INTERVIEWING').length,
    SELECTED: applications.filter(a => a.status === 'SELECTED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
  };

  const filtered = filter === 'ALL' ? applications : applications.filter(a => a.status === filter);

  return (
    <Layout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>
          My Applications
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          Track your application pipeline across all campus drives
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Applied', value: counts.ALL, color: '#6366f1' },
          { label: 'In Progress', value: counts.INTERVIEWING + counts.SHORTLISTED_TEST, color: '#fbbf24' },
          { label: 'Selected', value: counts.SELECTED, color: '#4ade80' },
          { label: 'Rejected', value: counts.REJECTED, color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '26px', fontWeight: '700', color, marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['ALL', 'APPLIED', 'SHORTLISTED_TEST', 'INTERVIEWING', 'SELECTED', 'REJECTED'].map(s => {
          const sc = s === 'ALL' ? null : statusConfig[s];
          const isActive = filter === s;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 14px', borderRadius: '999px', border: `1px solid ${isActive ? (sc?.border || 'rgba(99,102,241,0.5)') : 'var(--border)'}`,
              background: isActive ? (sc?.bg || 'rgba(99,102,241,0.12)') : 'transparent',
              color: isActive ? (sc?.color || '#818cf8') : 'var(--text-secondary)',
              fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s'
            }}>
              {s === 'ALL' ? 'All' : statusConfig[s]?.label} ({counts[s]})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} color="var(--accent-indigo)" className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Award size={40} style={{ margin: '0 auto 16px', color: 'var(--text-secondary)' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
            {applications.length === 0
              ? 'You haven\'t applied to any drives yet. Check the Job Board!'
              : 'No applications match this filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(app => <ApplicationCard key={app.id} app={app} />)}
        </div>
      )}
    </Layout>
  );
}
