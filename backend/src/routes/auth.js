import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db.js";
import { generateToken, authenticate } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const db = getDb();
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);
    if (existing) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    db.prepare(
      `
      INSERT INTO users (id, name, email, password, role)
      VALUES (?, ?, ?, ?, 'member')
    `,
    ).run(id, name, email, hashedPassword);

    // Log activity
    db.prepare(
      `
      INSERT INTO activities (id, user_id, action, resource_type, resource_title)
      VALUES (?, ?, 'joined', 'user', ?)
    `,
    ).run(uuidv4(), id, name);

    const user = db
      .prepare(
        "SELECT id, name, email, role, avatar, bio, location, website, created_at FROM users WHERE id = ?",
      )
      .get(id);
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = getDb();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    // Log activity
    db.prepare(
      `
      INSERT INTO activities (id, user_id, action, resource_type, resource_title)
      VALUES (?, ?, 'logged_in', 'user', ?)
    `,
    ).run(uuidv4(), user.id, user.name);

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  const db = getDb();
  const user = db
    .prepare(
      "SELECT id, name, email, role, avatar, bio, location, website, created_at FROM users WHERE id = ?",
    )
    .get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user });
});

export default router;
