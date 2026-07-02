import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import {
  Users, Building2, TrendingUp, Bell, CheckCircle, Clock,
  Loader2, BarChart3, Award, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TPODashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary/'),
      api.get('/tpo/announcements/'),
    ]).then(([analyticsRes, announcementsRes]) => {
      setAnalytics(analyticsRes.data);
      setAnnouncements(announcementsRes.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} color="var(--accent-indigo)" className="animate-spin" style={{ marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading TPO Command Center...</p>
        </div>
      </div>
    </Layout>
  );

  const summary = analytics?.placement_summary;
  const overview = analytics?.overview;
  const salaryStats = analytics?.salary_stats;

  const priorityColors = {
    LOW: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)' },
    MEDIUM: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
    HIGH: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
    URGENT: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.2)' },
  };

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>
          TPO Command Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          Placement season overview and quick management tools
        </p>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
        {[
          { label: 'Total Students', value: summary?.total_students ?? 0, color: '#6366f1', icon: Users, sub: 'Registered in system' },
          { label: 'Placed', value: summary?.placed_count ?? 0, color: '#4ade80', icon: CheckCircle, sub: `${summary?.placement_percentage ?? 0}% placement rate` },
          { label: 'Active Drives', value: overview?.active_drives ?? 0, color: '#fbbf24', icon: Building2, sub: 'Campus drives live' },
          { label: 'Companies', value: overview?.total_companies ?? 0, color: '#a78bfa', icon: BarChart3, sub: `${overview?.total_applications ?? 0} total applications` },
        ].map(({ label, value, color, icon: Icon, sub }) => (
          <div key={label} className="glass-card" style={{ padding: '22px', cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '6px' }}>{label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{sub}</div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Salary Stats */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="var(--accent-indigo)" /> Salary Overview (LPA)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: 'Highest CTC', value: salaryStats?.highest_ctc ?? 0, color: '#4ade80' },
              { label: 'Average CTC', value: salaryStats?.average_ctc ?? 0, color: '#fbbf24' },
              { label: 'Lowest CTC', value: salaryStats?.lowest_ctc ?? 0, color: '#f87171' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: '700', color }}>{value > 0 ? `₹${value}` : '—'}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recruiters */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={16} color="var(--accent-indigo)" /> Top Recruiters
            </h3>
            <button onClick={() => navigate('/tpo/analytics')} style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', cursor: 'pointer', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {analytics?.top_recruiters?.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No placements yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {analytics?.top_recruiters?.slice(0, 4).map((r, i) => (
                <div key={r.company_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: i === 0 ? '#fbbf24' : 'var(--text-secondary)', width: '20px', textAlign: 'center' }}>#{i + 1}</span>
                  <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{r.company_name}</span>
                  <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: '600' }}>{r.total_hired} hired</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={16} color="var(--accent-indigo)" /> Recent Announcements
          </h3>
          <button onClick={() => navigate('/tpo/announcements')} style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', cursor: 'pointer', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Manage <ArrowRight size={12} />
          </button>
        </div>
        {announcements.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No announcements yet. Post one to notify students.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {announcements.map(a => {
              const pc = priorityColors[a.priority] || priorityColors.MEDIUM;
              return (
                <div key={a.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span className="status-badge" style={{ background: pc.bg, color: pc.color, border: `1px solid ${pc.border}`, flexShrink: 0 }}>{a.priority}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{a.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{a.message.slice(0, 80)}...</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
