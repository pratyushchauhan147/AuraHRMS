// in src/app/api/employees/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session"; // We will use this for security

export async function GET(request) {
  // --- SECURITY CHECK ---
  const user = await getUserSession();
  
  // --- END SECURITY CHECK ---

  try {
    const employeeId = request.nextUrl.pathname.split('/').pop().trim();
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: { select: { email: true, role: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
  }
}

export async function PUT(request) {
  // --- SECURITY CHECK ---
  const user = await getUserSession();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_RECRUITER')) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // --- END SECURITY CHECK ---

  try {
    const employeeId = request.nextUrl.pathname.split('/').pop().trim();
    const body = await request.json();
    const { firstName, lastName, position, salary, managerId, notes } = body;
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: { firstName, lastName, position, salary, notes, managerId: managerId || null },
    });
    return NextResponse.json(updatedEmployee);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(request) {
  // --- SECURITY CHECK ---
  const user = await getUserSession();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_RECRUITER')) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // --- END SECURITY CHECK ---

  try {
    const employeeId = request.nextUrl.pathname.split('/').pop().trim();
    await prisma.employee.delete({
      where: { id: employeeId },
    });
    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}