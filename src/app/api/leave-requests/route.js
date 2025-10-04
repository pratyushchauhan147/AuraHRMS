// in src/app/api/leave-requests/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import * as jose from "jose";

// Helper function to get the current user's session
async function getUserSession() {
  const token = cookies().get("session-token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function POST(request) {
  const user = await getUserSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { startDate, endDate, reason } = await request.json();

    // Basic validation
    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start date and end date are required." }, { status: 400 });
    }

    // Find the employee profile linked to the logged-in user
    const employee = await prisma.employee.findUnique({
      where: { userId: user.id },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee profile not found." }, { status: 404 });
    }

    // Create the leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason,
        employeeId: employee.id, // Link to the employee profile
      },
    });

    return NextResponse.json(leaveRequest, { status: 201 });

  } catch (error) {
    console.error("Create Leave Request Error:", error);
    return NextResponse.json({ error: "Failed to create leave request." }, { status: 500 });
  }
}