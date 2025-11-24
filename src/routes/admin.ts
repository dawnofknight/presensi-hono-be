import { Hono } from "hono";
import { authMiddleware, adminOnly, type AuthPayload } from "../lib/auth";
import { prisma } from "../lib/prisma";

const app = new Hono();

// Get stats
app.get("/stats", authMiddleware, adminOnly, async (c) => {
  try {
    const totalEmployees = await prisma.user.count({
      where: { role: "EMPLOYEE" },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendances = await prisma.attendance.count({
      where: { checkIn: { gte: today } },
    });

    const onTime = await prisma.attendance.count({
      where: {
        checkIn: { gte: today },
        status: "TEPAT_WAKTU",
      },
    });

    const late = await prisma.attendance.count({
      where: {
        checkIn: { gte: today },
        status: "TERLAMBAT",
      },
    });

    return c.json({
      totalEmployees,
      todayAttendances,
      onTime,
      late,
    });
  } catch (error: any) {
    console.error("Stats error:", error);
    return c.json({ message: "Terjadi kesalahan server" }, 500);
  }
});

// Get all attendances
app.get("/attendances", authMiddleware, adminOnly, async (c) => {
  try {
    const attendances = await prisma.attendance.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { checkIn: "desc" },
    });

    return c.json(attendances);
  } catch (error: any) {
    console.error("Get attendances error:", error);
    return c.json({ message: "Terjadi kesalahan server" }, 500);
  }
});

// Get all employees
app.get("/employees", authMiddleware, adminOnly, async (c) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json(employees);
  } catch (error: any) {
    console.error("Get employees error:", error);
    return c.json({ message: "Terjadi kesalahan server" }, 500);
  }
});

// Get settings
app.get("/settings", authMiddleware, adminOnly, async (c) => {
  try {
    const settings = await prisma.pengaturan.findMany({
      where: {
        key: {
          in: ["work_start_time", "office_lat", "office_lng", "max_distance"],
        },
      },
    });

    const settingsObj: Record<string, string> = {};
    settings.forEach((setting: any) => {
      settingsObj[setting.key] = setting.value;
    });

    return c.json({
      work_start_time: settingsObj.work_start_time || "09:00",
      office_lat: settingsObj.office_lat || "-6.2088",
      office_lng: settingsObj.office_lng || "106.8456",
      max_distance: settingsObj.max_distance || "100",
    });
  } catch (error: any) {
    console.error("Get settings error:", error);
    return c.json({ message: "Terjadi kesalahan server" }, 500);
  }
});

// Save settings
app.post("/settings", authMiddleware, adminOnly, async (c) => {
  try {
    const { work_start_time, office_lat, office_lng, max_distance } =
      await c.req.json();

    const settingsToUpdate = [
      {
        key: "work_start_time",
        value: work_start_time,
        description: "Jam mulai kerja",
      },
      { key: "office_lat", value: office_lat, description: "Latitude kantor" },
      { key: "office_lng", value: office_lng, description: "Longitude kantor" },
      {
        key: "max_distance",
        value: max_distance,
        description: "Jarak maksimal check-in (meter)",
      },
    ];

    for (const setting of settingsToUpdate) {
      await prisma.pengaturan.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting,
      });
    }

    return c.json({ message: "Pengaturan berhasil disimpan" });
  } catch (error: any) {
    console.error("Save settings error:", error);
    return c.json({ message: "Terjadi kesalahan server" }, 500);
  }
});

export default app;
