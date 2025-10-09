// src/app/api/goals/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function GET(req) {
  const user = await getUserSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  const quarter = searchParams.get("quarter");

  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (quarter) where.quarter = quarter;

  const goals = await prisma.goal.findMany({
    where,
    include: { employee: { select: { id: true, firstName: true, lastName: true, position: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Normalize keyResults to always be an array
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
export async function POST(req) {
  const user = await getUserSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Only HR or ADMIN or Manager can create
  if (!["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { objective, keyResults, quarter, employeeId } = await req.json();

  if (!objective || !keyResults || !quarter || !employeeId)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const goal = await prisma.goal.create({
    data: {
      objective,
      keyResults,
      quarter,
      employeeId,
    },
  });

  return NextResponse.json(goal);
}
