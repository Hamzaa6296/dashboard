import { Router } from "express";
import { getDb } from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/stats/dashboard
router.get("/dashboard", authenticate, (req, res) => {
  const db = getDb();

  const totalProjects = db
    .prepare("SELECT COUNT(*) as count FROM projects")
    .get().count;
  const activeProjects = db
    .prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'active'")
    .get().count;
  const completedProjects = db
    .prepare(
      "SELECT COUNT(*) as count FROM projects WHERE status = 'completed'",
    )
    .get().count;
  const totalUsers = db
    .prepare("SELECT COUNT(*) as count FROM users")
    .get().count;

  const recentActivities = db
    .prepare(
      `
    SELECT a.*, u.name as user_name, u.avatar as user_avatar
    FROM activities a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 10
  `,
    )
    .all();

  const projectsByStatus = db
    .prepare(
      `
    SELECT status, COUNT(*) as count FROM projects GROUP BY status
  `,
    )
    .all();

  const projectsByPriority = db
    .prepare(
      `
    SELECT priority, COUNT(*) as count FROM projects GROUP BY priority
  `,
    )
    .all();

  // Projects created over last 7 days
  const projectTrend = db
    .prepare(
      `
    SELECT date(created_at) as date, COUNT(*) as count
    FROM projects
    WHERE created_at >= datetime('now', '-7 days')
    GROUP BY date(created_at)
    ORDER BY date ASC
  `,
    )
    .all();

  res.json({
    stats: {
      totalProjects,
      activeProjects,
      completedProjects,
      totalUsers,
    },
    projectsByStatus,
    projectsByPriority,
    projectTrend,
    recentActivities,
  });
});

export default router;
