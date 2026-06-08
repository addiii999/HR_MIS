import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      if (result.success) navigate('/dashboard');
      else setError(result.error || 'Invalid email or password');
      setLoading(false);
    }, 400);
  };

  return (
    <div className="login-page">
      <div className="bg-glow" />
      <div className="orb-container" style={{ opacity: 0.3 }}>
        <video autoPlay loop muted playsInline src="https://future.co/images/homepage/glassy-orb/orb-purple.webm" />
      </div>

      <div className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #0084ff, #60B1FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 12px rgba(0,132,255,0.3)'
          }}>H</div>
          <div>
            <h1>HR MIS</h1>
            <p className="subtitle" style={{ marginBottom: 0 }}>Human Resource Analytics Platform</p>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--danger)'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@hrms.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
              }}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{
            width: '100%', padding: '12px 0', fontSize: 14, marginTop: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            border: 'none', cursor: loading ? 'wait' : 'pointer', borderRadius: 16,
            fontFamily: 'var(--font-body)', fontWeight: 600
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <div style={{
              width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}><ArrowRight size={14} /></div>}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: '16px', background: 'rgba(0,132,255,0.03)', borderRadius: 12, border: '1px solid rgba(0,132,255,0.08)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-solid)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Demo Credentials</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <div><strong>HR Admin:</strong> admin@hrms.com / admin123</div>
            <div><strong>Dept Head:</strong> head@hrms.com / head123</div>
            <div><strong>Employee:</strong> emp@hrms.com / emp123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
