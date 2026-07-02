import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import {
  Building2, Users, Briefcase, Calendar, DollarSign, Loader2, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecruiterDashboard() {
  const [drives, setDrives] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/recruiter/drives/'),
      api.get('/auth/profile/recruiter/'),
    ]).then(([drivesRes, profileRes]) => {
      setDrives(drivesRes.data);
      setProfile(profileRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalApplicants = drives.reduce((sum, d) => sum + (d.applications_count || 0), 0);

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
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Recruiter Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          {profile?.company_name ? `Welcome back — ${profile.company_name}` : 'Manage your campus recruitment drives'}
        </p>
      </div>

      {/* Status banner if not approved */}
      {profile && !profile.is_approved && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            ⏳
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fbbf24' }}>Account Pending Approval</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Your recruiter account is awaiting TPO approval. You can set up your company profile in the meantime.</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
        {[
          { label: 'Active Drives', value: drives.length, color: '#6366f1', icon: Briefcase },
          { label: 'Total Applicants', value: totalApplicants, color: '#4ade80', icon: Users },
          { label: 'Company', value: profile?.company_name || '—', color: '#a78bfa', icon: Building2, small: true },
        ].map(({ label, value, color, icon: Icon, small }) => (
          <div key={label} className="glass-card" style={{ padding: '22px', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: small ? '16px' : '26px', fontWeight: '700', color, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Drives */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Your Campus Drives</h3>
          <button onClick={() => navigate('/recruiter/applicants')} style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View Applicants <ArrowRight size={13} />
          </button>
        </div>

        {drives.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            No campus drives found for your company yet. Contact the TPO to post drives.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {drives.map(drive => (
              <div key={drive.id} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Briefcase size={18} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{drive.job_profile}</div>
                  <div style={{ display: 'flex', gap: '14px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <DollarSign size={10} color="var(--accent-indigo)" /> ₹{drive.ctc} LPA
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <Calendar size={10} color="var(--accent-indigo)" />
                      {new Date(drive.visit_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className="status-badge" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', fontSize: '11px' }}>
                    {drive.applications_count ?? 0} applicants
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
