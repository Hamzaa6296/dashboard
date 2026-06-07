import { Link } from 'react-router-dom';
import { Zap, BarChart3, FolderKanban, Users, ArrowRight } from 'lucide-react';

const features = [
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Live metrics and activity tracking across all your projects.' },
  { icon: FolderKanban, title: 'Project Management', desc: 'Create, organize, and track projects with priority and status management.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Manage team members and their contributions in one place.' },
];

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Nav */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, background: 'var(--accent)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20 }}>Novu</span>
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{
            padding: '9px 18px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', color: 'var(--text-2)',
            fontSize: 14, fontWeight: 500, transition: 'border-color var(--transition)',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >Sign in</Link>
          <Link to="/register" style={{
            padding: '9px 18px', borderRadius: 'var(--radius-sm)',
            background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 500,
          }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: 'clamp(60px, 10vw, 100px) 24px 60px', maxWidth: 780, margin: '0 auto' }}>
        <div style={{
          display: 'inline-block', background: 'var(--accent-glow)',
          border: '1px solid rgba(124,106,247,0.3)', borderRadius: 20,
          padding: '6px 16px', fontSize: 13, color: 'var(--accent)',
          marginBottom: 28, fontWeight: 500,
        }}>
          ✦ Dashboard for high-performance teams
        </div>

        <h1 style={{
          fontFamily: 'Syne', fontSize: 'clamp(36px, 7vw, 72px)',
          fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 24,
          background: 'linear-gradient(135deg, #f0f0f8 30%, #7c6af7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Ship faster.<br />Track everything.
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2.5vw, 18px)', color: 'var(--text-2)',
          lineHeight: 1.7, marginBottom: 40, maxWidth: 520, margin: '0 auto 40px',
        }}>
          Novu gives your team a unified workspace to manage projects, track progress, and stay in sync — all in real time.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '13px 28px', background: 'var(--accent)', color: '#fff',
            borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 16,
            transition: 'all var(--transition)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,106,247,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            Start free <ArrowRight size={16} />
          </Link>
          <Link to="/login" style={{
            padding: '13px 28px', background: 'var(--bg-2)',
            border: '1px solid var(--border)', color: 'var(--text-2)',
            borderRadius: 'var(--radius-sm)', fontWeight: 500, fontSize: 16,
          }}>
            Try demo →
          </Link>
        </div>
      </section>

      {/* Dashboard preview */}
      <section style={{ padding: '0 clamp(16px, 4vw, 48px) 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          background: 'var(--bg-1)', border: '1px solid var(--border)',
          borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}>
          <div style={{
            background: 'var(--bg-2)', padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {['#f45b69', '#f6c94e', '#22d9a0'].map(c => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div style={{
            padding: 'clamp(12px, 3vw, 24px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 12,
          }}>
            {[
              { label: 'Total Projects', val: '12', color: 'var(--accent)' },
              { label: 'Active', val: '7', color: 'var(--green)' },
              { label: 'Completed', val: '3', color: 'var(--yellow)' },
              { label: 'Team Members', val: '4', color: 'var(--accent-2)' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{
                background: 'var(--bg-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '16px',
              }}>
                <div style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontFamily: 'Syne', fontWeight: 700, color }}>{val}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '20px clamp(16px, 4vw, 48px) 80px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
          Everything you need
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-2)', marginBottom: 48 }}>
          Designed for teams that move fast and care about quality.
        </p>
        <div className="landing-features">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title}
              style={{
                background: 'var(--bg-1)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: 'clamp(20px, 3vw, 28px)',
                transition: 'border-color var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{
                width: 44, height: 44, background: 'var(--accent-glow)',
                border: '1px solid rgba(124,106,247,0.25)', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
              }}>
                <Icon size={20} color="var(--accent)" />
              </div>
              <h3 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: 'clamp(16px, 3vw, 24px) clamp(16px, 4vw, 48px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12, color: 'var(--text-3)', fontSize: 13,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={14} color="var(--accent)" />
          <span>Novu Dashboard</span>
        </div>
        <span>Built with React + Express + SQLite</span>
      </footer>
    </div>
  );
}
