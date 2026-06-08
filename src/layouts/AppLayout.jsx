import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12, animation: 'float 2s ease infinite' }}>⚡</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-body)' }}>Loading HR MIS...</div>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      {/* Background glow ellipses */}
      <div className="bg-glow" />

      {/* Glassy orb */}
      <div className="orb-container">
        <video
          autoPlay
          loop
          muted
          playsInline
          src="https://future.co/images/homepage/glassy-orb/orb-purple.webm"
        />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <div className="main-content">
        <main className="page-content animate-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
