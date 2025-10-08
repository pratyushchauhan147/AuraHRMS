// in src/app/api/recruitment/candidates/[candidateId]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function GET(request, { params }) {
  const user = await getUserSession();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_RECRUITER')) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: params.candidateId },
      include: {
        applications: {
          include: {
            jobPosting: {
              select: {
                id: true,
                title: true,
              },
            },
            // --- THIS IS THE NEW PART ---
            interviews: {
              orderBy: {
                scheduledFor: 'desc',
              },
            },
            // --- END OF NEW PART ---
          },
          orderBy: {
            appliedAt: 'desc',
          },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }
    return NextResponse.json(candidate);
  } catch (error) {
    console.error("Failed to fetch candidate details:", error);
    return NextResponse.json({ error: "Failed to fetch candidate details" }, { status: 500 });
  }
}