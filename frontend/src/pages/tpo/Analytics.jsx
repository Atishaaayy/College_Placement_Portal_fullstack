import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { TrendingUp, Users, Award, Building2, Loader2, BarChart3 } from 'lucide-react';

function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px' }}>{label}</div>
        {sub && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  );
}

function BranchBar({ branch, placed, total }) {
  const pct = total > 0 ? (placed / total) * 100 : 0;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 60px 50px', gap: '12px', alignItems: 'center', padding: '10px 0' }}>
      <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{branch}</div>
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '4px', width: `${pct}%`, transition: 'width 1s ease',
          background: pct >= 75 ? '#4ade80' : pct >= 40 ? '#fbbf24' : '#818cf8'
        }} />
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>{placed}/{total}</div>
      <div style={{ fontSize: '12px', fontWeight: '600', color: pct >= 75 ? '#4ade80' : pct >= 40 ? '#fbbf24' : '#818cf8', textAlign: 'right' }}>{pct.toFixed(0)}%</div>
    </div>
  );
}

export default function TPOAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/summary/').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 size={36} color="var(--accent-indigo)" className="animate-spin" />
      </div>
    </Layout>
  );

  const { placement_summary, branch_breakdown, salary_stats, top_recruiters, overview } = data || {};

  return (
    <Layout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Placement Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          Comprehensive placement season data and insights
        </p>
      </div>

      {/* Top KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '28px' }}>
        <StatCard label="Total Placed" value={placement_summary?.placed_count ?? 0} sub={`${placement_summary?.placement_percentage ?? 0}% placement rate`} color="#4ade80" icon={Award} />
        <StatCard label="Unplaced" value={placement_summary?.unplaced_count ?? 0} sub={`Out of ${placement_summary?.total_students ?? 0} total students`} color="#f87171" icon={Users} />
      </div>

      {/* Salary Stats */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="var(--accent-indigo)" /> Salary Statistics (LPA)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { label: 'Highest Package', value: salary_stats?.highest_ctc, color: '#4ade80' },
            { label: 'Average Package', value: salary_stats?.average_ctc, color: '#fbbf24' },
            { label: 'Lowest Package', value: salary_stats?.lowest_ctc, color: '#f87171' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '20px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color, marginBottom: '6px' }}>
                {value > 0 ? `₹${value}` : '—'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Branch Breakdown */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--accent-indigo)" /> Branch-Wise Placements
          </h3>
          <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '8px', paddingBottom: '8px', display: 'grid', gridTemplateColumns: '120px 1fr 60px 50px', gap: '12px' }}>
            {['Branch', 'Progress', 'Placed', '%'].map(h => (
              <div key={h} style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: h === '%' ? 'right' : h === 'Placed' ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>
          {branch_breakdown?.filter(b => b.total > 0).map(b => (
            <BranchBar key={b.branch_code} branch={b.branch_name} placed={b.placed} total={b.total} />
          ))}
          {!branch_breakdown?.some(b => b.total > 0) && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No student data available.</p>
          )}
        </div>

        {/* Top Recruiters */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="var(--accent-indigo)" /> Top Recruiters
          </h3>
          {top_recruiters?.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No placements recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {top_recruiters?.map((r, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                const maxHired = top_recruiters[0]?.total_hired || 1;
                const barWidth = (r.total_hired / maxHired) * 100;
                return (
                  <div key={r.company_id} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '16px', minWidth: '28px' }}>{medal}</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{r.company_name}</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#4ade80' }}>{r.total_hired} hired</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${barWidth}%`, borderRadius: '2px', background: i === 0 ? '#fbbf24' : 'rgba(99,102,241,0.8)', transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Active Drives', value: overview?.active_drives ?? 0, color: '#fbbf24', icon: Building2 },
          { label: 'Total Applications', value: overview?.total_applications ?? 0, color: '#818cf8', icon: Users },
          { label: 'Total Companies', value: overview?.total_companies ?? 0, color: '#60a5fa', icon: Building2 },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '700', color }}>{value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
