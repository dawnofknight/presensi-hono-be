import { Context, Next } from "hono";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json({ message: "Token tidak ditemukan" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = verify(token, JWT_SECRET) as AuthPayload;
    c.set("user", payload);
    await next();
  } catch (error) {
    return c.json({ message: "Token tidak valid" }, 401);
  }
};

export const adminOnly = async (c: Context, next: Next) => {
  const user = c.get("user") as AuthPayload;

  if (user.role !== "ADMIN") {
    return c.json({ message: "Forbidden" }, 403);
  }

  await next();
};
