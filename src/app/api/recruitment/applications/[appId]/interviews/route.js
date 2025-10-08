// in src/app/api/recruitment/applications/[appId]/interviews/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function POST(request, { params }) {
  const user = await getUserSession();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_RECRUITER')) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const applicationId = params.appId;
    const body = await request.json();
    const { scheduledFor, feedback } = body; // 'feedback' could be interviewer notes

    if (!scheduledFor) {
      return NextResponse.json({ error: "The 'scheduledFor' date is required." }, { status: 400 });
    }

    // Use a transaction to create the interview AND update the application status
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the new interview record
      const newInterview = await tx.interview.create({
        data: {
          applicationId: applicationId,
          scheduledFor: new Date(scheduledFor),
          feedback: feedback || null,
        },
      });

      // 2. Update the parent application's status to 'INTERVIEW'
      await tx.application.update({
        where: { id: applicationId },
        data: { status: 'INTERVIEW' },
      });

      return newInterview;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("Schedule Interview Error:", error);
    return NextResponse.json({ error: "Failed to schedule interview" }, { status: 500 });
  }
}