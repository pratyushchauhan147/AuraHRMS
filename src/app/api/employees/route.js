// in src/app/api/employees/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getUserSession } from "@/lib/session"; // We will use this for security

export async function GET(request) {
  const user = await getUserSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isPrivilegedUser = user.role === 'ADMIN' || user.role === 'HR_RECRUITER';

  try {
    let employees;

    if (isPrivilegedUser) {
      // --- ADMIN / HR VIEW ---
      // They see everyone.
      console.log("Fetching all employees for Admin/HR");
      employees = await prisma.employee.findMany({
        include: {
          user: { select: { email: true } },
          manager: { select: { firstName: true, lastName: true } },
        },
        orderBy: { firstName: 'asc' }
      });
    } else {
      // --- MANAGER / EMPLOYEE VIEW ---
      // First, find the current user's own employee profile.
      const self = await prisma.employee.findUnique({
        where: { userId: user.id },
      });

      if (!self) return NextResponse.json([]); // Return empty if no profile

      if (user.role === 'SENIOR_MANAGER') {
        // A Manager sees only their direct reports.
        console.log(`Fetching direct reports for Manager ID: ${self.id}`);
        employees = await prisma.employee.findMany({
          where: { managerId: self.id },
          include: { user: { select: { email: true } } },
          orderBy: { firstName: 'asc' },
        });
      } else { // Regular EMPLOYEE
        // An Employee sees their teammates (people with the same manager).
        console.log(`Fetching teammates for Employee with Manager ID: ${self.managerId}`);
        if (!self.managerId) {
          employees = [self]; // If they have no manager, just show themself
        } else {
          employees = await prisma.employee.findMany({
            where: { managerId: self.managerId },
            include: { user: { select: { email: true } } },
            orderBy: { firstName: 'asc' },
          });
        }
      }
    }
    return NextResponse.json(employees);
  } catch (error) {
    console.error("List Employees Error:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}


export async function POST(request) {
  // --- SECURITY CHECK ---
  const user = await getUserSession();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_RECRUITER')) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // --- END SECURITY CHECK ---

  try {
    const body = await request.json();
    const { firstName, lastName, email, password, position, role, contactNumber, address } = body;

    if (!firstName || !lastName || !email || !password || !position || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error("User with this email already exists.");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await tx.user.create({
        data: { email, password: hashedPassword, role },
      });
      const newEmployee = await tx.employee.create({
        data: { firstName, lastName, position, userId: newUser.id, contactNumber, address },
      });
      return { newUser, newEmployee };
    });

    return NextResponse.json(result.newEmployee, { status: 201 });
  } catch (error) {
    if (error.message.includes("User with this email already exists")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}