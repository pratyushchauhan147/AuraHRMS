//status
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function GET() {
  const user = await getUserSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });
  if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findFirst({
    where: { employeeId: employee.id, date: today },
  });

  if (!attendance) {
    return NextResponse.json({ clockedIn: false, totalHours: 0 });
  }

  const sessions = JSON.parse(attendance.sessions);
  const lastSession = sessions[sessions.length - 1];

  let total = 0;
  for (const s of sessions) {
    if (s.clockIn && s.clockOut) {
      total += (new Date(s.clockOut) - new Date(s.clockIn)) / (1000 * 60 * 60);
    }
  }

  const isClockedIn = lastSession && !lastSession.clockOut;

  return NextResponse.json({
    clockedIn: isClockedIn,
    totalHours: total.toFixed(2),
    lastClockIn: lastSession?.clockIn || null,
  });
}
