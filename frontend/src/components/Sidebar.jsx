import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Briefcase, User, FileText, Bell,
  Users, Settings, BarChart3, Building2, LogOut, GraduationCap
} from 'lucide-react';

const studentLinks = [
  { to: '/student/dashboard', icon: Briefcase, label: 'Job Board' },
  { to: '/student/applications', icon: FileText, label: 'My Applications' },
  { to: '/student/profile', icon: User, label: 'My Profile' },
];

const tpoLinks = [
  { to: '/tpo/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tpo/drives', icon: Building2, label: 'Campus Drives' },
  { to: '/tpo/verification', icon: Users, label: 'Student Verification' },
  { to: '/tpo/announcements', icon: Bell, label: 'Announcements' },
  { to: '/tpo/analytics', icon: BarChart3, label: 'Analytics' },
];

const recruiterLinks = [
  { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/recruiter/applicants', icon: Users, label: 'Applicants' },
  { to: '/recruiter/profile', icon: Building2, label: 'Company Profile' },
];

const roleLinks = { STUDENT: studentLinks, TPO: tpoLinks, RECRUITER: recruiterLinks };
const roleTitles = {
  STUDENT: { label: 'Student Portal', color: '#6366f1' },
  TPO: { label: 'TPO Command', color: '#8b5cf6' },
  RECRUITER: { label: 'Recruiter Hub', color: '#3b82f6' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = roleLinks[user?.role] || [];
  const title = roleTitles[user?.role] || {};

  const handleLogout = async () => {
    await logout();
    navigate('/login/student');
  };

  return (
    <aside style={{
      width: '240px', minHeight: '100vh', background: 'rgba(255,255,255,0.02)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      padding: '24px 16px', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
      backdropFilter: 'blur(20px)'
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: `linear-gradient(135deg, ${title.color}, #8b5cf6)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <GraduationCap size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>PlaceHub</div>
            <div style={{ fontSize: '11px', color: title.color, fontWeight: '600' }}>{title.label}</div>
          </div>
        </div>
      </div>

      {/* User badge */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', borderRadius: '12px',
        padding: '12px', marginBottom: '24px', border: '1px solid var(--border)'
      }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
          {user?.full_name}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email}
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px', textDecoration: 'none',
            fontSize: '13px', fontWeight: '500', transition: 'all 0.15s',
            background: isActive ? `linear-gradient(135deg, ${title.color}22, #8b5cf622)` : 'transparent',
            color: isActive ? title.color : 'var(--text-secondary)',
            border: isActive ? `1px solid ${title.color}33` : '1px solid transparent',
          })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout} style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 12px', borderRadius: '10px', border: 'none',
        background: 'rgba(239,68,68,0.08)', color: '#f87171',
        fontSize: '13px', fontWeight: '500', cursor: 'pointer', width: '100%',
        marginTop: '16px', transition: 'all 0.15s'
      }}>
        <LogOut size={16} />
        Sign Out
      </button>
    </aside>
  );
}
