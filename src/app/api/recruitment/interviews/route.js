// in src/app/api/recruitment/interviews/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function GET(request) {
  const user = await getUserSession();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_RECRUITER')) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    // Fetch interviews scheduled for today or in the future
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    const interviews = await prisma.interview.findMany({
      where: {
        scheduledFor: {
          gte: today, // gte means "greater than or equal to"
        },
      },
      include: {
        application: {
          include: {
            candidate: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            jobPosting: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });

    return NextResponse.json(interviews);
  } catch (error) {
    console.error("Failed to fetch interviews:", error);
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
  }
}