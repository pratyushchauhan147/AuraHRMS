// in src/app/api/recruitment/jobs/[jobId]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

// GET handler to get a single job posting by ID
export async function GET(request, { params }) {
  try {
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: params.jobId },
    });

    if (!jobPosting) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }
    return NextResponse.json(jobPosting);
  } catch (error) {
    console.error("Failed to fetch job posting:", error);
    return NextResponse.json({ error: "Failed to fetch job posting" }, { status: 500 });
  }
}

// PUT handler to update a job posting
export async function PUT(request, { params }) {
  const user = await getUserSession();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_RECRUITER')) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const { title, description, isOpen } = await request.json();
    const updatedJobPosting = await prisma.jobPosting.update({
      where: { id: params.jobId },
      data: {
        title,
        description,
        isOpen,
      },
    });
    return NextResponse.json(updatedJobPosting);
  } catch (error) {
    console.error("Failed to update job posting:", error);
    return NextResponse.json({ error: "Failed to update job posting" }, { status: 500 });
  }
}

// DELETE handler to delete a job posting
export async function DELETE(request, { params }) {
  const user = await getUserSession();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_RECRUITER')) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  
  try {
    await prisma.jobPosting.delete({
      where: { id: params.jobId },
    });
    return NextResponse.json({ message: "Job posting deleted successfully" });
  } catch (error) {
    console.error("Failed to delete job posting:", error);
    return NextResponse.json({ error: "Failed to delete job posting" }, { status: 500 });
  }
}