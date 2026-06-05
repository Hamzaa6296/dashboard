import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  FolderKanban,
  User,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 40,
            display: "none",
          }}
          className="mobile-overlay"
        />
      )}
      <aside
        style={{
          width: 240,
          minHeight: "100vh",
          background: "var(--bg-1)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transition: "transform var(--transition)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 40,
            padding: "0 8px",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: "var(--accent)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span
            style={{
              fontFamily: "Syne",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "-0.5px",
            }}
          >
            Novu
          </span>
        </div>
        <nav
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}
        >
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                color: isActive ? "var(--accent)" : "var(--text-2)",
                background: isActive ? "var(--accent-glow)" : "transparent",
                fontWeight: isActive ? 500 : 400,
                transition: "all var(--transition)",
                fontSize: 15,
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--accent), var(--accent-2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}
                className="truncate"
              >
                {user?.name}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--text-3)" }}
                className="truncate"
              >
                {user?.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              background: "none",
              border: "none",
              color: "var(--text-3)",
              fontSize: 15,
              transition: "all var(--transition)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--red)";
              e.currentTarget.style.background = "rgba(244,91,105,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-3)";
              e.currentTarget.style.background = "none";
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <div
        style={{
          flex: 1,
          marginLeft: 240,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            display: "none",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-1)",
          }}
          className="mobile-header"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Zap size={20} color="var(--accent)" />
            <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18 }}>
              Novu
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text)",
              padding: 4,
            }}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        <main
          style={{
            flex: 1,
            padding: "32px 36px",
            animation: "fadeIn 0.35s ease",
          }}
        >
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          aside { transform: ${sidebarOpen ? "translateX(0)" : "translateX(-100%)"}; }
          .mobile-header { display: flex !important; }
          .mobile-overlay { display: block !important; }
          main { margin-left: 0 !important; padding: 20px !important; }
          div[style*="margin-left: 240px"] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
