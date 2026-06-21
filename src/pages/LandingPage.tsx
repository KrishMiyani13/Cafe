import React, { useState } from 'react';
import { useCafe } from '../context/CafeContext';
import { Modal } from '../components/Modal';
import { Coffee, QrCode, MonitorPlay, Sparkles, ChefHat, CreditCard, ArrowRight, LogIn } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { login } = useCafe();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(true);
  const [email, setEmail] = useState('');
  const [cafeName, setCafeName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email.');
      return;
    }
    if (isRegister && !cafeName) {
      setError('Please enter your cafe name.');
      return;
    }

    try {
      const cafe = login(email, isRegister ? cafeName : email);
      if (cafe) {
        setIsModalOpen(false);
        window.location.hash = '#/dashboard';
      }
    } catch (err) {
      setError('Login/Registration failed. Please try again.');
    }
  };

  const handleDemoClick = () => {
    // Navigate to unwind-cafe table 3
    window.location.hash = '#/cafe/unwind-cafe/table/3';
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-platform)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="app-header">
        <div className="container flex-between">
          <div className="app-logo">
            <Coffee size={28} />
            <span>TableBite</span>
          </div>
          <div className="flex-row">
            <button className="btn btn-outline btn-sm" onClick={handleDemoClick}>
              Try Demo Cafe
            </button>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => {
                setIsRegister(false);
                setIsModalOpen(true);
                setEmail('');
                setCafeName('');
                setError('');
              }}
            >
              <LogIn size={16} />
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, padding: '80px 0' }} className="animate-slide-up">
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(99, 102, 241, 0.12)', 
              border: '1px solid rgba(99, 102, 241, 0.3)', 
              padding: '6px 16px', 
              borderRadius: '9999px',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '24px'
            }}
          >
            <Sparkles size={14} /> Next-Gen Cafe SaaS
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '24px', fontWeight: 800 }}>
            The Smart QR Ordering <br />
            <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Platform for Cafes
            </span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', marginBottom: '40px', lineHeight: 1.6 }}>
            Empower your cafe or restaurant with custom-branded digital menus. Customers scan QR codes, order their food, and pay bills directly from their table. No apps required.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setIsRegister(true);
                setIsModalOpen(true);
                setEmail('');
                setCafeName('');
                setError('');
              }}
            >
              Register Your Cafe <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline" onClick={handleDemoClick}>
              Explore Demo Menu
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <section className="container" style={{ marginTop: '100px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '48px', fontSize: '2rem' }}>How TableBite Works</h2>
          <div className="grid-3">
            {/* Feature 1 */}
            <div className="glass-card" style={{ padding: '32px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <QrCode size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>1. Generate Table QRs</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Add your restaurant tables and instantly generate high-quality QR codes linked specifically to each table. Print and place them on your tables.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card" style={{ padding: '32px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                <ChefHat size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>2. Customers Browse & Order</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Customers scan the QR code to open your fully customized menu with your branding, colors, and logo. They customize food options and order instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card" style={{ padding: '32px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <MonitorPlay size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>3. Live Order Queue</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Receive orders instantly in real-time on your Manager Dashboard. Fire orders to the kitchen immediately and track their preparation status.
              </p>
            </div>
          </div>
        </section>

        {/* Demo instructions alert */}
        <section className="container" style={{ marginTop: '64px', maxWidth: '800px' }}>
          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--secondary)', display: 'flex', gap: '16px', alignItems: 'center', textAlign: 'left' }}>
            <CreditCard size={32} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>Want to test the Multi-Tab Live Sync?</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Click <strong>Try Demo Cafe</strong> to view the menu as a customer, or <strong>Login</strong> with <code>hello@unvindcafe.com</code> to open the manager dashboard. Place them side-by-side or on dual monitors to watch orders sync live!
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div className="container flex-between">
          <div>© {new Date().getFullYear()} TableBite Inc. All rights reserved.</div>
          <div className="flex-row">
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span>•</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          </div>
        </div>
      </footer>

      {/* Registration/Login Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isRegister ? 'Register your Cafe' : 'Partner Login'}>
        <form onSubmit={handleSubmit} className="payment-form">
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Email Address</label>
            <input 
              type="email" 
              className="glass-input" 
              placeholder="e.g. manager@mycafe.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Cafe Name</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="e.g. Coffee & Co"
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
                required={isRegister}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {isRegister ? 'Create Cafe Account' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {isRegister ? 'Already registered?' : 'New to TableBite?'}
            </span>{' '}
            <button 
              type="button" 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
            >
              {isRegister ? 'Sign In Here' : 'Register Here'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
