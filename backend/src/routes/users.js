import { Router } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "../db.js";
import { authenticate } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /api/users - list all users (admin)
router.get("/", authenticate, (req, res) => {
  const db = getDb();
  const users = db
    .prepare(
      `
    SELECT id, name, email, role, avatar, bio, location, created_at
    FROM users ORDER BY created_at DESC
  `,
    )
    .all();
  res.json({ users });
});

// GET /api/users/:id
router.get("/:id", authenticate, (req, res) => {
  const db = getDb();
  const user = db
    .prepare(
      `
    SELECT id, name, email, role, avatar, bio, location, website, created_at
    FROM users WHERE id = ?
  `,
    )
    .get(req.params.id);

  if (!user) return res.status(404).json({ error: "User not found" });

  const projects = db
    .prepare(
      `
    SELECT id, title, status, priority, progress, created_at
    FROM projects WHERE owner_id = ?
    ORDER BY created_at DESC LIMIT 5
  `,
    )
    .all(req.params.id);

  res.json({ user, projects });
});

// PUT /api/users/:id - update profile
router.put("/:id", authenticate, async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { name, bio, location, website, avatar } = req.body;
  const db = getDb();

  db.prepare(
    `
    UPDATE users SET
      name = COALESCE(?, name),
      bio = COALESCE(?, bio),
      location = COALESCE(?, location),
      website = COALESCE(?, website),
      avatar = COALESCE(?, avatar),
      updated_at = datetime('now')
    WHERE id = ?
  `,
  ).run(name, bio, location, website, avatar, req.params.id);

  // Log activity
  db.prepare(
    `
    INSERT INTO activities (id, user_id, action, resource_type, resource_title)
    VALUES (?, ?, 'updated_profile', 'user', ?)
  `,
  ).run(uuidv4(), req.user.id, name || "profile");

  const updated = db
    .prepare(
      "SELECT id, name, email, role, avatar, bio, location, website FROM users WHERE id = ?",
    )
    .get(req.params.id);
  res.json({ user: updated });
});

// PUT /api/users/:id/password
router.put("/:id/password", authenticate, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Both current and new password required" });
  }

  const db = getDb();
  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(req.params.id);

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid)
    return res.status(401).json({ error: "Current password incorrect" });

  const hashed = await bcrypt.hash(newPassword, 10);
  db.prepare(
    "UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(hashed, req.params.id);

  res.json({ message: "Password updated" });
});

// DELETE /api/users/:id
router.delete("/:id", authenticate, (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const db = getDb();
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ message: "User deleted" });
});

export default router;
