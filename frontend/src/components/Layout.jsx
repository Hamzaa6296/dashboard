import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FolderKanban, User, LogOut, Menu, X, Zap
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="app-shell">

      {/* Overlay — mobile only */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 40, padding: '0 8px'
        }}>
          <div style={{
            width: 34, height: 34, background: 'var(--accent)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, letterSpacing: '-0.5px' }}>
            Novu
          </span>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--accent)' : 'var(--text-2)',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                fontWeight: isActive ? 500 : 400,
                transition: 'all var(--transition)',
                fontSize: 15,
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', marginBottom: 4,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 500 }} className="truncate">{user?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--radius-sm)',
              background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 15,
              transition: 'all var(--transition)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--red)';
              e.currentTarget.style.background = 'rgba(244,91,105,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-3)';
              e.currentTarget.style.background = 'none';
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">

        {/* Mobile top bar */}
        <header className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, background: 'var(--accent)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>Novu</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none', border: 'none', color: 'var(--text)',
              padding: 6, display: 'flex', alignItems: 'center', borderRadius: 6,
            }}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
