import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import "../src/types"; // Import types to augment Hono Context
import authRoutes from "../src/routes/auth";
import attendanceRoutes from "../src/routes/attendance";
import adminRoutes from "../src/routes/admin";
import userRoutes from "../src/routes/user";

const app = new Hono().basePath("/api");

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
app.route("/auth", authRoutes);
app.route("/attendance", attendanceRoutes);
app.route("/admin", adminRoutes);
app.route("/user", userRoutes);

export default handle(app);
