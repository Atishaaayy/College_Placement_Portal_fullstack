import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Users, CheckCircle, Clock, Search, Loader2, Star, Hash, BookOpen } from 'lucide-react';

export default function TPOVerification() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/tpo/verification/').then(r => setStudents(r.data)).finally(() => setLoading(false));
  }, []);

  const handleToggleStatus = async (profile) => {
    const newStatus = profile.verification_status === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
    setUpdating(profile.id);
    try {
      await api.patch(`/tpo/verification/${profile.id}/`, { verification_status: newStatus });
      setStudents(prev => prev.map(s => s.id === profile.id ? { ...s, verification_status: newStatus } : s));
      setMessage(`${profile.user_name || 'Student'} marked as ${newStatus}.`);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = students
    .filter(s => filter === 'ALL' || s.verification_status === filter)
    .filter(s =>
      !search ||
      s.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
      s.user_email?.toLowerCase().includes(search.toLowerCase())
    );

  const verifiedCount = students.filter(s => s.verification_status === 'VERIFIED').length;
  const pendingCount = students.filter(s => s.verification_status === 'PENDING').length;

  return (
    <Layout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Student Verification Queue
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          Cross-reference student CGPA and academic records
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Students', value: students.length, color: '#6366f1', icon: Users },
          { label: 'Verified', value: verifiedCount, color: '#4ade80', icon: CheckCircle },
          { label: 'Pending', value: pendingCount, color: '#fbbf24', icon: Clock },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="glass-card" style={{ padding: '18px 22px', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '700', color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', display: 'flex', gap: '8px', color: '#4ade80', fontSize: '13px' }}>
          <CheckCircle size={16} /> {message}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="form-input" style={{ paddingLeft: '36px' }} placeholder="Search by name, roll no, or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['ALL', 'PENDING', 'VERIFIED'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s',
            border: `1px solid ${filter === f ? 'rgba(99,102,241,0.5)' : 'var(--border)'}`,
            background: filter === f ? 'rgba(99,102,241,0.15)' : 'transparent',
            color: filter === f ? '#818cf8' : 'var(--text-secondary)'
          }}>{f === 'ALL' ? `All (${students.length})` : f === 'PENDING' ? `Pending (${pendingCount})` : `Verified (${verifiedCount})`}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} color="var(--accent-indigo)" className="animate-spin" />
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
            {['Student', 'Roll No', 'Branch', 'CGPA', 'Backlogs', 'Status'].map(h => (
              <div key={h} style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No students match your filter.
            </div>
          ) : (
            filtered.map((student, i) => (
              <div key={student.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px',
                gap: '12px', padding: '16px 20px', alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                transition: 'background 0.1s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{student.user_name || 'N/A'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{student.user_email || ''}</div>
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', fontSize: '13px', color: 'var(--text-primary)' }}>
                  <Hash size={11} color="var(--accent-indigo)" /> {student.roll_number}
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', fontSize: '13px', color: 'var(--text-primary)' }}>
                  <BookOpen size={11} color="var(--accent-indigo)" /> {student.branch}
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  <Star size={11} color="var(--accent-indigo)" /> {student.cgpa}
                </div>
                <div style={{ fontSize: '13px', color: student.active_backlogs > 0 ? '#f87171' : 'var(--text-primary)' }}>
                  {student.active_backlogs}
                </div>
                <button
                  onClick={() => handleToggleStatus(student)}
                  disabled={updating === student.id}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    background: student.verification_status === 'VERIFIED' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                    color: student.verification_status === 'VERIFIED' ? '#4ade80' : '#fbbf24',
                    opacity: updating === student.id ? 0.7 : 1
                  }}>
                  {updating === student.id ? <Loader2 size={12} className="animate-spin" /> :
                    student.verification_status === 'VERIFIED' ? '✓ Verified' : '⏳ Pending'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </Layout>
  );
}
