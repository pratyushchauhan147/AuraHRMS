import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";
import { Role } from "@prisma/client";

/**
 * GET /api/attendance
 * Fetch all attendance records (HR/Admin only)
 */
export async function GET() {
  const user = await getUserSession();
  if (!user || (user.role !== Role.ADMIN && user.role !== Role.HR_RECRUITER)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const records = await prisma.attendance.findMany({
      orderBy: { date: "desc" },
      include: {
        employee: { select: { firstName: true, lastName: true, position: true } },
      },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Fetch attendance error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

/**
 * POST /api/attendance
 * Handles both Clock-In and Clock-Out logic for logged-in employees
 */
export async function POST(request) {
  const user = await getUserSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { action } = await request.json(); // "clockIn" or "clockOut"
    if (!action || !["clockIn", "clockOut"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Find employee linked to the logged-in user
    const employee = await prisma.employee.findUnique({
      where: { userId: user.id },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employee profile not found" }, { status: 404 });
    }

    // Normalize date (to match one attendance record per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await prisma.attendance.findFirst({
      where: { employeeId: employee.id, date: today },
    });

    // CLOCK IN
    if (action === "clockIn") {
      if (!attendance) {
        attendance = await prisma.attendance.create({
          data: {
            employeeId: employee.id,
            date: today,
            sessions: JSON.stringify([{ clockIn: new Date().toISOString() }]),
          },
        });
        return NextResponse.json({ message: "Clock-in recorded", attendance });
      } else {
        const sessions = JSON.parse(attendance.sessions);
        const lastSession = sessions[sessions.length - 1];
        if (lastSession && !lastSession.clockOut) {
          return NextResponse.json({ error: "You are already clocked in" }, { status: 400 });
        }
        sessions.push({ clockIn: new Date().toISOString() });
        const updated = await prisma.attendance.update({
          where: { id: attendance.id },
          data: { sessions: JSON.stringify(sessions) },
        });
        return NextResponse.json({ message: "Clock-in added", attendance: updated });
      }
    }

    // CLOCK OUT
    if (action === "clockOut") {
      if (!attendance) {
        return NextResponse.json({ error: "No clock-in found for today" }, { status: 400 });
      }

      const sessions = JSON.parse(attendance.sessions);
      const lastSession = sessions[sessions.length - 1];
      if (!lastSession || lastSession.clockOut) {
        return NextResponse.json({ error: "You are not currently clocked in" }, { status: 400 });
      }

      lastSession.clockOut = new Date().toISOString();

      // Calculate total hours
      let total = 0;
      for (const s of sessions) {
        if (s.clockIn && s.clockOut) {
          total += (new Date(s.clockOut) - new Date(s.clockIn)) / (1000 * 60 * 60);
        }
      }

      const updated = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          sessions: JSON.stringify(sessions),
          totalHours: total,
          overtime: total > 8 ? total - 8 : 0,
        },
      });

      return NextResponse.json({ message: "Clock-out recorded", attendance: updated });
    }

  } catch (error) {
    console.error("Attendance update error:", error);
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}

/**
 * PATCH /api/attendance
 * Manually update attendance (Admin/HR only)
 */
export async function PATCH(request) {
  const user = await getUserSession();
  if (!user || (user.role !== Role.ADMIN && user.role !== Role.HR_RECRUITER)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const { attendanceId, status } = await request.json();
    if (!attendanceId || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Manual attendance update error:", error);
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}
