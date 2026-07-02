import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login/student" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap = {
      STUDENT: '/student/dashboard',
      TPO: '/tpo/dashboard',
      RECRUITER: '/recruiter/dashboard',
    };
    return <Navigate to={redirectMap[user.role] || '/login/student'} replace />;
  }

  return children;
}
