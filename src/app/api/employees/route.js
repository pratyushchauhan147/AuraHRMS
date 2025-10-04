// in src/app/api/employees/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// The GET function to list all employees (no changes)
export async function GET(request) {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: { select: { email: true } },
        manager: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("List Employees Error:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

// --- UPDATED POST function ---
export async function POST(request) {
  try {
    const body = await request.json();
    // 1. Add the new fields to the destructuring
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
        data: {
          email,
          password: hashedPassword,
          role,
        },
      });

      // 2. Add the new fields to the create call
      const newEmployee = await tx.employee.create({
        data: {
          firstName,
          lastName,
          position,
          userId: newUser.id,
          contactNumber, // <-- Added
          address,       // <-- Added
        },
      });

      return { newUser, newEmployee };
    });

    return NextResponse.json(result.newEmployee, { status: 201 });

  } catch (error) {
    console.error("Create Employee Error:", error);
    if (error.message.includes("User with this email already exists")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}