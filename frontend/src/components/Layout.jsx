import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        marginLeft: '240px', flex: 1,
        padding: '32px', minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        {children}
      </main>
    </div>
  );
}
