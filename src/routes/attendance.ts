import { Hono } from "hono";
import { authMiddleware, type AuthPayload } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { calculateDistance } from "../lib/helpers";

const app = new Hono();

// Get today's attendance
app.get("/today", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as AuthPayload;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: user.userId,
        checkIn: { gte: today },
      },
    });

    return c.json(attendance);
  } catch (error: any) {
    console.error("Get today attendance error:", error);
    return c.json({ message: "Terjadi kesalahan server" }, 500);
  }
});

// Get user attendance history
app.get("/user", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as AuthPayload;

    const attendances = await prisma.attendance.findMany({
      where: { userId: user.userId },
      orderBy: { checkIn: "desc" },
      take: 30,
    });

    return c.json(attendances);
  } catch (error: any) {
    console.error("Get user attendance error:", error);
    return c.json({ message: "Terjadi kesalahan server" }, 500);
  }
});

// Check-in
app.post("/checkin", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as AuthPayload;
    const { latitude, longitude } = await c.req.json();

    // Get geofencing settings
    const settings = await prisma.pengaturan.findMany({
      where: {
        key: { in: ["office_lat", "office_lng", "max_distance"] },
      },
    });

    const settingsObj: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    const officeLat = parseFloat(settingsObj.office_lat || "-6.2088");
    const officeLng = parseFloat(settingsObj.office_lng || "106.8456");
    const maxDistance = parseFloat(settingsObj.max_distance || "100");

    // Calculate distance
    const distance = calculateDistance(
      latitude,
      longitude,
      officeLat,
      officeLng
    );

    // Check if within geofence
    if (distance > maxDistance) {
      return c.json(
        {
          message: `Anda berada di luar area kantor. Jarak Anda: ${Math.round(
            distance
          )}m, maksimal: ${maxDistance}m`,
          distance: Math.round(distance),
          maxDistance,
        },
        403
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: user.userId,
        checkIn: { gte: today },
      },
    });

    if (existingAttendance) {
      return c.json({ message: "Anda sudah melakukan check-in hari ini" }, 400);
    }

    // Get work start time setting
    const workStartTimeSetting = await prisma.pengaturan.findUnique({
      where: { key: "work_start_time" },
    });

    const workStartTime = workStartTimeSetting?.value || "09:00";
    const [startHour, startMinute] = workStartTime.split(":").map(Number);
    const checkInTime = new Date();
    const workStartDateTime = new Date();
    workStartDateTime.setHours(startHour, startMinute, 0, 0);

    const status =
      checkInTime <= workStartDateTime ? "TEPAT_WAKTU" : "TERLAMBAT";

    const attendance = await prisma.attendance.create({
      data: {
        userId: user.userId,
        checkIn: checkInTime,
        status,
      },
    });

    return c.json({
      message: "Check-in berhasil",
      attendance,
    });
  } catch (error: any) {
    console.error("Check-in error:", error);
    return c.json({ message: "Terjadi kesalahan server" }, 500);
  }
});

// Check-out
app.put("/checkout/:id", authMiddleware, async (c) => {
  try {
    const user = c.get("user") as AuthPayload;
    const id = c.req.param("id");

    const attendance = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      return c.json({ message: "Presensi tidak ditemukan" }, 404);
    }

    if (attendance.userId !== user.userId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    if (attendance.checkOut) {
      return c.json({ message: "Anda sudah melakukan check-out" }, 400);
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: { checkOut: new Date() },
    });

    return c.json({
      message: "Check-out berhasil",
      attendance: updatedAttendance,
    });
  } catch (error: any) {
    console.error("Check-out error:", error);
    return c.json({ message: "Terjadi kesalahan server" }, 500);
  }
});

export default app;
