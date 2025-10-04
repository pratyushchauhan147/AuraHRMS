// in src/app/api/employees/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Handles GET requests for a single employee
export async function GET(request) {
  try {
    // --- FIX APPLIED HERE ---
    const employeeId = request.nextUrl.pathname.split('/').pop();
    
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
    console.error("Get Employee Error:", error);
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
  }
}

// Handles PUT (Update) requests
export async function PUT(request) {
  try {
    // --- FIX APPLIED HERE ---
    const employeeId = request.nextUrl.pathname.split('/').pop();
    const body = await request.json();
    
    const { 
      firstName, 
      lastName, 
      position, 
      salary, 
      managerId,
      notes,
    } = body;

    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        firstName,
        lastName,
        position,
        salary,
        notes,
        managerId: managerId || null,
      },
    });

    return NextResponse.json(updatedEmployee);

  } catch (error) {
    console.error("Update Employee Error:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

// Handles DELETE requests
export async function DELETE(request) {
  try {
    // --- FIX APPLIED HERE ---
    const employeeId = request.nextUrl.pathname.split('/').pop();

    await prisma.employee.delete({
      where: { id: employeeId },
    });

    return NextResponse.json({ message: "Employee deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Employee Error:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}