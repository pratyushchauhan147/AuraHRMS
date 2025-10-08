// in src/app/api/recruitment/candidates/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

// This GET function to list all candidates is the same as before
export async function GET(request) {
  const user = await getUserSession();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_RECRUITER')) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { applications: true } } },
    });
    return NextResponse.json(candidates);
  } catch (error) {
    console.error("Failed to fetch candidates:", error);
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}

// --- NEW: POST handler to create a new candidate ---
export async function POST(request) {
    const user = await getUserSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_RECRUITER')) {
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { firstName, lastName, email, phone } = body;

        if (!firstName || !lastName || !email) {
            return NextResponse.json({ error: "First name, last name, and email are required." }, { status: 400 });
        }

        // Check if a candidate with this email already exists to avoid duplicates
        const existingCandidate = await prisma.candidate.findUnique({
            where: { email },
        });

        if (existingCandidate) {
            return NextResponse.json({ error: "A candidate with this email already exists." }, { status: 409 }); // 409 Conflict
        }

        const newCandidate = await prisma.candidate.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
            },
        });

        return NextResponse.json(newCandidate, { status: 201 });
    } catch (error) {
        console.error("Failed to create candidate:", error);
        return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
    }
}