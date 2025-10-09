// src/app/api/goals/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function GET(req, { params }) {
  const user = await getUserSession();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Only HR, Admin, or Manager can view a specific goal
  if (!["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = params;

  const goal = await prisma.goal.findUnique({
    where: { id },
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true, position: true },
      },
    },
  });

  if (!goal)
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });

 
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

export async function PUT(req, { params }) {
  const user = await getUserSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = params;
  const { objective, keyResults, status, quarter } = await req.json();

  const updatedGoal = await prisma.goal.update({
    where: { id },
    data: { objective, keyResults, status, quarter },
  });

  return NextResponse.json(updatedGoal);
}

export async function DELETE(req, { params }) {
  const user = await getUserSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!["ADMIN", "HR_RECRUITER"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = params;
  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
