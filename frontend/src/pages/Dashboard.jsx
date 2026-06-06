import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FolderKanban,
  Users,
  CheckCircle,
  TrendingUp,
  Clock,
  Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const PIE_COLORS = ["#7c6af7", "#22d9a0", "#f6c94e", "#5f5f7a"];

function StatCard({ icon: Icon, label, value, color, trend }) {
  return (
    <div
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "border-color var(--transition)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = color)}
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--border)")
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: `${color}22`,
            border: `1px solid ${color}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} color={color} />
        </div>
        {trend && (
          <span
            style={{ fontSize: 12, color: "var(--green)", fontWeight: 500 }}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <div
          style={{ fontSize: 30, fontFamily: "Syne", fontWeight: 700, color }}
        >
          {value}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-3)", marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  const actionColors = {
    created: "var(--green)",
    updated: "var(--accent)",
    deleted: "var(--red)",
    joined: "var(--yellow)",
    logged_in: "var(--text-3)",
  };
  const color = actionColors[activity.action] || "var(--text-3)";
  const initials =
    activity.user_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";
  const time = new Date(activity.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 14 }}>
          <strong style={{ color: "var(--text)" }}>{activity.user_name}</strong>{" "}
          <span style={{ color }}>{activity.action}</span>{" "}
          {activity.resource_title && (
            <span style={{ color: "var(--text-2)" }}>
              {activity.resource_title}
            </span>
          )}
        </span>
      </div>
      <span style={{ fontSize: 12, color: "var(--text-3)", flexShrink: 0 }}>
        {time}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/stats/dashboard")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  if (loading)
    return (
      <div
        style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}
      >
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );

  const stats = data?.stats || {};

  return (
    <div className="fade-in" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 32,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Syne",
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 15 }}>
            Here's what's happening with your projects today.
          </p>
        </div>
        <Link
          to="/projects"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: "var(--accent)",
            color: "#fff",
            borderRadius: "var(--radius-sm)",
            fontSize: 14,
            fontWeight: 500,
            transition: "opacity var(--transition)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus size={16} /> New Project
        </Link>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard
          icon={FolderKanban}
          label="Total Projects"
          value={stats.totalProjects ?? 0}
          color="var(--accent)"
        />
        <StatCard
          icon={TrendingUp}
          label="Active"
          value={stats.activeProjects ?? 0}
          color="var(--green)"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={stats.completedProjects ?? 0}
          color="var(--yellow)"
        />
        <StatCard
          icon={Users}
          label="Team Members"
          value={stats.totalUsers ?? 0}
          color="var(--accent-2)"
        />
      </div>

      {/* Charts row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {/* Bar chart */}
        <div
          style={{
            background: "var(--bg-1)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
          }}
        >
          <h3
            style={{
              fontFamily: "Syne",
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            Projects Created (7 days)
          </h3>
          {data?.projectTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.projectTrend} barSize={28}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--text-3)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--text-3)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text)",
                  }}
                  cursor={{ fill: "var(--bg-3)" }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--accent)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-3)",
                fontSize: 14,
              }}
            >
              No project data yet
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div
          style={{
            background: "var(--bg-1)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
          }}
        >
          <h3
            style={{
              fontFamily: "Syne",
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            By Status
          </h3>
          {data?.projectsByStatus?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={data.projectsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                  >
                    {data.projectsByStatus.map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--text)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginTop: 8,
                }}
              >
                {data.projectsByStatus.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 13,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span
                        style={{
                          color: "var(--text-2)",
                          textTransform: "capitalize",
                        }}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{entry.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-3)",
                fontSize: 14,
              }}
            >
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div
        style={{
          background: "var(--bg-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3 style={{ fontFamily: "Syne", fontSize: 16, fontWeight: 600 }}>
            Recent Activity
          </h3>
          <Clock size={16} color="var(--text-3)" />
        </div>
        {data?.recentActivities?.length > 0 ? (
          data.recentActivities.map((a) => (
            <ActivityItem key={a.id} activity={a} />
          ))
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              color: "var(--text-3)",
              fontSize: 14,
            }}
          >
            No activity yet. Create a project to get started!
          </div>
        )}
      </div>
    </div>
  );
}
