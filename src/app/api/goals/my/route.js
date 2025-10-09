// src/app/api/goals/my/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function GET() {
  const user = await getUserSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Find employeeId from userId
  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  if (!employee)
    return NextResponse.json({ error: "Employee profile not found" }, { status: 404 });

  const goals = await prisma.goal.findMany({
    where: { employeeId: employee.id },
    orderBy: { createdAt: "desc" },
  });
  


const normalizedGoals = goals.map(goal => ({
  ...goal,
  keyResults: Array.isArray(goal.keyResults)
    ? goal.keyResults
    : typeof goal.keyResults === "string"
    ? (() => {
        try {
          const parsed = JSON.parse(goal.keyResults);
          return Array.isArray(parsed) ? parsed : [goal.keyResults];
        } catch {
          return [goal.keyResults];
        }
      })()
    : [],
}));

return NextResponse.json(normalizedGoals);
}
