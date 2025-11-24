import { Hono } from "hono";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

app.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ message: "Email dan password harus diisi" }, 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return c.json({ message: "Email atau password salah" }, 401);
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return c.json({ message: "Email atau password salah" }, 401);
    }

    const token = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return c.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return c.json(
      { message: "Terjadi kesalahan server", error: error.message },
      500
    );
  }
});

export default app;
