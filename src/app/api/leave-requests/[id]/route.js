// in src/app/api/leave-requests/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// --- 1. IMPORT OUR NEW HELPER FUNCTION ---
import { getUserSession } from "@/lib/session";



export async function PATCH(request, { params }) {
  // --- 3. WE NOW CALL THE IMPORTED FUNCTION ---
  const user = await getUserSession();

  if (!user || (user.role !== 'SENIOR_MANAGER' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const leaveRequestId = params.id;
    const { status } = await request.json();

    if (!["APPROVED", "DENIED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: { 
        employee: { select: { managerId: true } }
      },
    });

    if (!leaveRequest) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    if (user.role === 'SENIOR_MANAGER') {
      const managerProfile = await prisma.employee.findUnique({ where: { userId: user.id }});
      if (!managerProfile || leaveRequest.employee.managerId !== managerProfile.id) {
        return NextResponse.json({ error: "You are not authorized to manage this request." }, { status: 403 });
      }
    }

    const updatedRequest = await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: { status },
    });

    return NextResponse.json(updatedRequest);

  } catch (error) {
    console.error("Update Leave Request Error:", error);
    return NextResponse.json({ error: "Failed to update leave request." }, { status: 500 });
  }
}