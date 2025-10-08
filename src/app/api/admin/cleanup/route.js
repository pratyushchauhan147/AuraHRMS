// in src/app/api/admin/cleanup/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";
import { subMonths } from "date-fns";

export async function POST(request) {
  const user = await getUserSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    // --- 1. GET THE NUMBER OF MONTHS FROM THE REQUEST BODY ---
    const { months } = await request.json();

    // Add validation for the input
    if (!months || typeof months !== 'number' || months < 1) {
      return NextResponse.json({ error: "A valid number of months is required." }, { status: 400 });
    }

    // --- 2. USE THE DYNAMIC 'months' VALUE ---
    const cutoffDate = subMonths(new Date(), months);

    const oldApplications = await prisma.application.findMany({
      where: {
        status: 'REJECTED',
        appliedAt: {
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
        interviews: { select: { id: true } },
      }
    });

    if (oldApplications.length === 0) {
      return NextResponse.json({ message: `No rejected applications older than ${months} months to clean up.` });
    }

    const applicationIdsToDelete = oldApplications.map(app => app.id);
    const interviewIdsToDelete = oldApplications.flatMap(app => app.interviews.map(interview => interview.id));

    const [deletedInterviews, deletedApplications] = await prisma.$transaction([
      prisma.interview.deleteMany({
        where: { id: { in: interviewIdsToDelete } },
      }),
      prisma.application.deleteMany({
        where: { id: { in: applicationIdsToDelete } },
      }),
    ]);

    const message = `Cleanup successful. Deleted ${deletedApplications.count} rejected applications and ${deletedInterviews.count} associated interviews older than ${months} months.`;
    return NextResponse.json({ message });

  } catch (error) {
    console.error("Cleanup API Error:", error);
    return NextResponse.json({ error: "Failed to perform cleanup." }, { status: 500 });
  }
}