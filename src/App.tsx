import { useState } from 'react';
import { CarbonProvider, useCarbon } from './context/CarbonContext';
import { Calculator } from './components/Calculator';
import { Dashboard } from './components/Dashboard';
import { DailyTracker } from './components/DailyTracker';
import { Insights } from './components/Insights';
import { Milestones } from './components/Milestones';
import { 
  Leaf, LayoutDashboard, CalendarDays, 
  LineChart, Trophy
} from 'lucide-react';
import './App.css';

type Tab = 'dashboard' | 'tracker' | 'insights' | 'milestones';

const AppContent: React.FC = () => {
  const { hasCalculated, points } = useCarbon();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Level calculator
  const level = Math.floor(points / 250) + 1;

  if (!hasCalculated) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '90vh', justifyContent: 'center' }}>
        <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Leaf size={32} style={{ color: 'var(--color-primary)', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))' }} />
            <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>
              Eco<span className="gradient-text">Pulse</span>
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Your personal ecological guidance system</p>
        </header>
        
        <Calculator />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <header className="nav-header">
        <div className="nav-container">
          {/* Logo */}
          <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
            <Leaf size={24} aria-hidden="true" />
            <span>Eco<span className="gradient-text">Pulse</span></span>
          </a>

          {/* Navigation links */}
          <nav className="nav-links" role="tablist">
            <button 
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              role="tab"
              aria-selected={activeTab === 'dashboard'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <LayoutDashboard size={16} aria-hidden="true" /> Dashboard
              </span>
            </button>
            <button 
              className={`nav-link ${activeTab === 'tracker' ? 'active' : ''}`}
              onClick={() => setActiveTab('tracker')}
              role="tab"
              aria-selected={activeTab === 'tracker'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <CalendarDays size={16} aria-hidden="true" /> Action Log
              </span>
            </button>
            <button 
              className={`nav-link ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
              role="tab"
              aria-selected={activeTab === 'insights'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <LineChart size={16} aria-hidden="true" /> Insights
              </span>
            </button>
            <button 
              className={`nav-link ${activeTab === 'milestones' ? 'active' : ''}`}
              onClick={() => setActiveTab('milestones')}
              role="tab"
              aria-selected={activeTab === 'milestones'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Trophy size={16} aria-hidden="true" /> Milestones
              </span>
            </button>
          </nav>

          {/* User profile level tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="md-block">
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '20px', padding: '0.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}>
              <Trophy size={14} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Lvl {level}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1 }}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'tracker' && <DailyTracker />}
        {activeTab === 'insights' && <Insights />}
        {activeTab === 'milestones' && <Milestones />}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-glass)', padding: '1.5rem',
        textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Leaf size={14} style={{ color: 'var(--color-primary)' }} />
          <span>EcoPulse Carbon Assistant — Track, Understand, and Reduce.</span>
        </div>
        <div>Built for premium sustainable tracking. Deployable on Vercel.</div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <CarbonProvider>
      <AppContent />
    </CarbonProvider>
  );
}

export default App;
