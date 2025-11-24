import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import authRoutes from "./routes/auth";
import attendanceRoutes from "./routes/attendance";
import adminRoutes from "./routes/admin";
import userRoutes from "./routes/user";

const app = new Hono();

// CORS middleware
app.use("/*", cors());

// Health check
app.get("/", (c) => c.json({ message: "Presensi API" }));

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/attendance", attendanceRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/user", userRoutes);

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

console.log(`Server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
