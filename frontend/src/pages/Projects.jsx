import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  active: {
    bg: "rgba(124,106,247,0.15)",
    text: "var(--accent)",
    border: "rgba(124,106,247,0.3)",
  },
  completed: {
    bg: "rgba(34,217,160,0.15)",
    text: "var(--green)",
    border: "rgba(34,217,160,0.3)",
  },
  paused: {
    bg: "rgba(246,201,78,0.15)",
    text: "var(--yellow)",
    border: "rgba(246,201,78,0.3)",
  },
  archived: {
    bg: "rgba(95,95,122,0.15)",
    text: "var(--text-3)",
    border: "rgba(95,95,122,0.3)",
  },
};
const PRIORITY_COLORS = {
  critical: "var(--red)",
  high: "var(--orange)",
  medium: "var(--yellow)",
  low: "var(--green)",
};

function Badge({ text }) {
  const s = STATUS_COLORS[text] || {
    bg: "var(--bg-3)",
    text: "var(--text-2)",
    border: "var(--border)",
  };
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        textTransform: "capitalize",
      }}
    >
      {text}
    </span>
  );
}

function ProgressBar({ value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "var(--bg-3)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: value >= 100 ? "var(--green)" : "var(--accent)",
            borderRadius: 3,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 12,
          color: "var(--text-3)",
          minWidth: 32,
          textAlign: "right",
        }}
      >
        {value}%
      </span>
    </div>
  );
}

const EMPTY_FORM = {
  title: "",
  description: "",
  status: "active",
  priority: "medium",
  due_date: "",
  tags: "",
  progress: 0,
};

function ProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState(
    project
      ? {
          ...project,
          tags: Array.isArray(project.tags) ? project.tags.join(", ") : "",
        }
      : EMPTY_FORM,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        progress: Number(form.progress),
      };
      if (project) {
        await api.put(`/projects/${project.id}`, payload);
      } else {
        await api.post("/projects", payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    background: "var(--bg-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
  };
  const labelStyle = {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-2)",
    display: "block",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "var(--bg-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: 540,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2 style={{ fontFamily: "Syne", fontSize: 20, fontWeight: 700 }}>
            {project ? "Edit Project" : "New Project"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-2)",
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {error && (
            <div
              style={{
                background: "rgba(244,91,105,0.1)",
                border: "1px solid rgba(244,91,105,0.3)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px",
                color: "var(--red)",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label style={labelStyle}>Title *</label>
            <input
              required
              value={form.title}
              onChange={set("title")}
              placeholder="Project name"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              placeholder="What's this project about?"
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={form.status}
                onChange={set("status")}
                style={inputStyle}
              >
                {["active", "completed", "paused", "archived"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select
                value={form.priority}
                onChange={set("priority")}
                style={inputStyle}
              >
                {["low", "medium", "high", "critical"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={labelStyle}>Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={set("due_date")}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={labelStyle}>Progress ({form.progress}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.progress}
                onChange={set("progress")}
                style={{
                  width: "100%",
                  marginTop: 8,
                  accentColor: "var(--accent)",
                }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={set("tags")}
              placeholder="react, node, api"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 4,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-2)",
                fontSize: 14,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 20px",
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: 14,
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {loading && (
                <div className="spinner" style={{ width: 16, height: 16 }} />
              )}
              {project ? "Save changes" : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState(null); // null | 'create' | project object
  const [deleteId, setDeleteId] = useState(null);

  const fetchProjects = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, limit: 8 };
        if (search) params.search = search;
        if (filterStatus) params.status = filterStatus;
        const res = await api.get("/projects", { params });
        setProjects(res.data.projects);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [search, filterStatus],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects(1);
  }, [fetchProjects]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setDeleteId(null);
      fetchProjects(pagination.page);
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
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
            Projects
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 15 }}>
            {pagination.total} project{pagination.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setModal("create")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-3)",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              background: "var(--bg-1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text)",
              fontSize: 14,
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "10px 12px",
            background: "var(--bg-1)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text-2)",
            fontSize: 14,
            outline: "none",
          }}
        >
          <option value="">All statuses</option>
          {["active", "completed", "paused", "archived"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--bg-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[
                  "Project",
                  "Status",
                  "Priority",
                  "Progress",
                  "Due Date",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 40 }}>
                    <div className="spinner" style={{ margin: "0 auto" }} />
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "48px 16px",
                      color: "var(--text-3)",
                      fontSize: 14,
                    }}
                  >
                    No projects found.{" "}
                    {!search && !filterStatus && (
                      <button
                        onClick={() => setModal("create")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--accent)",
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        Create one?
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      transition: "background var(--transition)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg-2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "14px 16px", maxWidth: 280 }}>
                      <div
                        style={{ fontWeight: 500, fontSize: 14 }}
                        className="truncate"
                      >
                        {p.title}
                      </div>
                      {p.description && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-3)",
                            marginTop: 2,
                          }}
                          className="truncate"
                        >
                          {p.description}
                        </div>
                      )}
                      {p.tags?.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            flexWrap: "wrap",
                            marginTop: 4,
                          }}
                        >
                          {p.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              style={{
                                background: "var(--bg-3)",
                                color: "var(--text-3)",
                                fontSize: 11,
                                padding: "1px 6px",
                                borderRadius: 4,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <Badge text={p.status} />
                    </td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: PRIORITY_COLORS[p.priority] || "var(--text-2)",
                          textTransform: "capitalize",
                        }}
                      >
                        {p.priority}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", minWidth: 140 }}>
                      <ProgressBar value={p.progress || 0} />
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 13,
                        color: "var(--text-2)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.due_date
                        ? new Date(p.due_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => setModal(p)}
                          style={{
                            padding: "6px 8px",
                            background: "var(--bg-3)",
                            border: "1px solid var(--border)",
                            borderRadius: 6,
                            color: "var(--text-2)",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        {(p.owner_id === user?.id || user?.role === "admin") &&
                          (deleteId === p.id ? (
                            <div style={{ display: "flex", gap: 4 }}>
                              <button
                                onClick={() => handleDelete(p.id)}
                                style={{
                                  padding: "6px 8px",
                                  background: "rgba(244,91,105,0.15)",
                                  border: "1px solid rgba(244,91,105,0.3)",
                                  borderRadius: 6,
                                  color: "var(--red)",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteId(null)}
                                style={{
                                  padding: "6px 8px",
                                  background: "var(--bg-3)",
                                  border: "1px solid var(--border)",
                                  borderRadius: 6,
                                  color: "var(--text-2)",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteId(p.id)}
                              style={{
                                padding: "6px 8px",
                                background: "var(--bg-3)",
                                border: "1px solid var(--border)",
                                borderRadius: 6,
                                color: "var(--text-3)",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>
              Page {pagination.page} of {pagination.pages}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => fetchProjects(pagination.page - 1)}
                disabled={pagination.page <= 1}
                style={{
                  padding: "6px 12px",
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: pagination.page <= 1 ? "var(--text-3)" : "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 13,
                }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => fetchProjects(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                style={{
                  padding: "6px 12px",
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color:
                    pagination.page >= pagination.pages
                      ? "var(--text-3)"
                      : "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 13,
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modal === "create" || (modal && typeof modal === "object")) && (
        <ProjectModal
          project={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => fetchProjects(pagination.page)}
        />
      )}
    </div>
  );
}
