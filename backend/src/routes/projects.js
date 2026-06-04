import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/projects
router.get("/", authenticate, (req, res) => {
  const { status, priority, search, page = 1, limit = 10 } = req.query;
  const db = getDb();

  let query = `
    SELECT p.*, u.name as owner_name, u.avatar as owner_avatar
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += " AND p.status = ?";
    params.push(status);
  }
  if (priority) {
    query += " AND p.priority = ?";
    params.push(priority);
  }
  if (search) {
    query += " AND (p.title LIKE ? OR p.description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  const countQuery = query.replace(
    "SELECT p.*, u.name as owner_name, u.avatar as owner_avatar",
    "SELECT COUNT(*) as total",
  );
  const total = db.prepare(countQuery).get(...params)?.total || 0;

  query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
  params.push(Number(limit), (Number(page) - 1) * Number(limit));

  const projects = db
    .prepare(query)
    .all(...params)
    .map((p) => ({
      ...p,
      tags: JSON.parse(p.tags || "[]"),
    }));

  res.json({
    projects,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  });
});

// GET /api/projects/:id
router.get("/:id", authenticate, (req, res) => {
  const db = getDb();
  const project = db
    .prepare(
      `
    SELECT p.*, u.name as owner_name, u.avatar as owner_avatar
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE p.id = ?
  `,
    )
    .get(req.params.id);

  if (!project) return res.status(404).json({ error: "Project not found" });

  res.json({ project: { ...project, tags: JSON.parse(project.tags || "[]") } });
});

// POST /api/projects
router.post("/", authenticate, (req, res) => {
  const {
    title,
    description,
    status = "active",
    priority = "medium",
    due_date,
    tags = [],
    progress = 0,
  } = req.body;

  if (!title) return res.status(400).json({ error: "Title is required" });

  const db = getDb();
  const id = uuidv4();

  db.prepare(
    `
    INSERT INTO projects (id, title, description, status, priority, owner_id, due_date, tags, progress)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    title,
    description,
    status,
    priority,
    req.user.id,
    due_date,
    JSON.stringify(tags),
    progress,
  );

  // Log activity
  db.prepare(
    `
    INSERT INTO activities (id, user_id, action, resource_type, resource_id, resource_title)
    VALUES (?, ?, 'created', 'project', ?, ?)
  `,
  ).run(uuidv4(), req.user.id, id, title);

  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
  res
    .status(201)
    .json({ project: { ...project, tags: JSON.parse(project.tags || "[]") } });
});

// PUT /api/projects/:id
router.put("/:id", authenticate, (req, res) => {
  const db = getDb();
  const project = db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .get(req.params.id);

  if (!project) return res.status(404).json({ error: "Project not found" });
  if (project.owner_id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { title, description, status, priority, due_date, tags, progress } =
    req.body;

  db.prepare(
    `
    UPDATE projects SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      priority = COALESCE(?, priority),
      due_date = COALESCE(?, due_date),
      tags = COALESCE(?, tags),
      progress = COALESCE(?, progress),
      updated_at = datetime('now')
    WHERE id = ?
  `,
  ).run(
    title,
    description,
    status,
    priority,
    due_date,
    tags ? JSON.stringify(tags) : null,
    progress,
    req.params.id,
  );

  // Log activity
  db.prepare(
    `
    INSERT INTO activities (id, user_id, action, resource_type, resource_id, resource_title)
    VALUES (?, ?, 'updated', 'project', ?, ?)
  `,
  ).run(uuidv4(), req.user.id, req.params.id, title || project.title);

  const updated = db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .get(req.params.id);
  res.json({ project: { ...updated, tags: JSON.parse(updated.tags || "[]") } });
});

// DELETE /api/projects/:id
router.delete("/:id", authenticate, (req, res) => {
  const db = getDb();
  const project = db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .get(req.params.id);

  if (!project) return res.status(404).json({ error: "Project not found" });
  if (project.owner_id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);

  // Log activity
  db.prepare(
    `
    INSERT INTO activities (id, user_id, action, resource_type, resource_id, resource_title)
    VALUES (?, ?, 'deleted', 'project', ?, ?)
  `,
  ).run(uuidv4(), req.user.id, req.params.id, project.title);

  res.json({ message: "Project deleted" });
});

export default router;
