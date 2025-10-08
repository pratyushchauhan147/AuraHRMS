// in src/app/api/recruitment/jobs/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

// GET handler to list all job postings
export async function GET(request) {
  // Security check: ensure user is authorized
  const user = await getUserSession();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_RECRUITER')) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const jobPostings = await prisma.jobPosting.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });
    return NextResponse.json(jobPostings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch job postings" }, { status: 500 });
  }
}

// POST handler to create a new job posting
export async function POST(request) {
  const user = await getUserSession();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_RECRUITER')) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const { title, description } = await request.json();
    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const newJobPosting = await prisma.jobPosting.create({
      data: { title, description },
    });

    return NextResponse.json(newJobPosting, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create job posting" }, { status: 500 });
  }
}