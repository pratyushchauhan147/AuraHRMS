// in src/app/api/recruitment/apply/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { jobId, firstName, lastName, email, phone } = body;

    if (!jobId || !firstName || !lastName || !email) {
      return NextResponse.json({ error: "Missing required fields: jobId, firstName, lastName, email" }, { status: 400 });
    }

    // We use a transaction to ensure both operations (or neither) succeed.
    const newApplication = await prisma.$transaction(async (tx) => {
      // Step 1: Find or create the candidate
      let candidate = await tx.candidate.findUnique({
        where: { email },
      });

      if (!candidate) {
        candidate = await tx.candidate.create({
          data: {
            firstName,
            lastName,
            email,
            phone,
          },
        });
      }

      // Step 2: Check if this candidate has already applied for this specific job
      const existingApplication = await tx.application.findFirst({
        where: {
          candidateId: candidate.id,
          jobPostingId: jobId,
        },
      });

      if (existingApplication) {
        // By throwing an error, the transaction will be safely rolled back.
        throw new Error("This candidate has already applied for this job.");
      }

      // Step 3: Create the new Application record
      const application = await tx.application.create({
        data: {
          jobPostingId: jobId,
          candidateId: candidate.id,
          status: 'APPLIED', // Default status
        },
      });

      return application;
    });

    return NextResponse.json(newApplication, { status: 201 });

  } catch (error) {
    console.error("Apply API Error:", error);
    if (error.message.includes("already applied")) {
        return NextResponse.json({ error: error.message }, { status: 409 }); // 409 Conflict
    }
    return NextResponse.json({ error: "Failed to create application." }, { status: 500 });
  }
}