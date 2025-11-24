import { Hono } from "hono";
import { cors } from "hono/cors";
import "./types"; // Import types to augment Hono Context
import authRoutes from "./routes/auth";
import attendanceRoutes from "./routes/attendance";
import adminRoutes from "./routes/admin";
import userRoutes from "./routes/user";

const app = new Hono();

// CORS middleware
app.use(
  "/*",
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-frontend-domain.vercel.app",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Health check
app.get("/", (c) => c.json({ message: "Presensi API" }));

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/attendance", attendanceRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/user", userRoutes);

export default app;
