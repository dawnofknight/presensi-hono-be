import { Hono } from "hono";
import { hash, compare } from "bcryptjs";
import { authMiddleware, type AuthPayload } from "../lib/auth";
import { prisma } from "../lib/prisma";

const app = new Hono();

// Change password
app.post("/change-password", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const { currentPassword, newPassword } = await c.req.json();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (!dbUser) {
      return c.json({ message: "User tidak ditemukan" }, 404);
    }

    const isPasswordValid = await compare(currentPassword, dbUser.password);

    if (!isPasswordValid) {
      return c.json({ message: "Password saat ini salah" }, 401);
    }

    const hashedPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.userId },
      data: { password: hashedPassword },
    });

    return c.json({ message: "Password berhasil diubah" });
  } catch (error: any) {
    console.error("Change password error:", error);
    return c.json({ message: "Terjadi kesalahan server" }, 500);
  }
});

export default app;
