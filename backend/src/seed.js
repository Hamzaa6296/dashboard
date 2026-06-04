import { initDb, getDb } from "./db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

initDb();

const db = getDb();

console.log("🌱 Seeding database...");

// Clear existing data
db.exec("DELETE FROM activities");
db.exec("DELETE FROM projects");
db.exec("DELETE FROM users");

// Create users
const users = [
  {
    id: uuidv4(),
    name: "Alex Rivera",
    email: "alex@demo.com",
    role: "admin",
    bio: "Full-stack developer and team lead",
    location: "San Francisco, CA",
    website: "https://alexrivera.dev",
  },
  {
    id: uuidv4(),
    name: "Jordan Chen",
    email: "jordan@demo.com",
    role: "member",
    bio: "Frontend specialist",
    location: "New York, NY",
    website: "",
  },
  {
    id: uuidv4(),
    name: "Sam Taylor",
    email: "sam@demo.com",
    role: "member",
    bio: "Backend engineer",
    location: "Austin, TX",
    website: "",
  },
];

const password = await bcrypt.hash("password123", 10);

for (const user of users) {
  db.prepare(
    `
    INSERT INTO users (id, name, email, password, role, bio, location, website)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    user.id,
    user.name,
    user.email,
    password,
    user.role,
    user.bio,
    user.location,
    user.website,
  );
}

console.log("✅ Users created");

// Create projects
const statuses = ["active", "completed", "paused", "archived"];
const priorities = ["low", "medium", "high", "critical"];
const tagPool = [
  "react",
  "node",
  "api",
  "design",
  "mobile",
  "backend",
  "frontend",
  "database",
  "devops",
];

const projectNames = [
  "E-commerce Platform Redesign",
  "Mobile App MVP",
  "API Gateway Migration",
  "Analytics Dashboard",
  "Authentication Service",
  "Design System Implementation",
  "CI/CD Pipeline Setup",
  "Performance Optimization",
  "Customer Portal",
  "Internal Admin Tool",
  "Data Export Feature",
  "Notification System",
];

for (let i = 0; i < projectNames.length; i++) {
  const id = uuidv4();
  const owner = users[i % users.length];
  const tags = tagPool
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 1);
  const progress = Math.floor(Math.random() * 100);

  db.prepare(
    `
    INSERT INTO projects (id, title, description, status, priority, owner_id, due_date, tags, progress)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    projectNames[i],
    `This project focuses on ${projectNames[i].toLowerCase()}. It involves planning, execution, and delivery across multiple sprints.`,
    statuses[i % statuses.length],
    priorities[i % priorities.length],
    owner.id,
    new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    JSON.stringify(tags),
    progress,
  );

  db.prepare(
    `
    INSERT INTO activities (id, user_id, action, resource_type, resource_id, resource_title)
    VALUES (?, ?, 'created', 'project', ?, ?)
  `,
  ).run(uuidv4(), owner.id, id, projectNames[i]);
}

console.log("✅ Projects created");
console.log("\n🎉 Seed complete!");
console.log("\nDemo accounts:");
users.forEach((u) => console.log(`  ${u.email} / password123`));
