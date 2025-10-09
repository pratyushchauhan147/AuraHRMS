// app/api/payslip/[employeeId]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function GET(_, { params }) {
  try {
    const user = await getUserSession();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { employeeId } = params;

    // Only Admin, HR, or same employee can access
    if (
      !["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(user.role) &&
      user.id !== employeeId
    )
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const payslips = await prisma.payslip.findMany({
      where: { employeeId },
      include: {
        payroll: { select: { month: true, year: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payslips);
  } catch (err) {
    console.error("Payslip Fetch Error:", err);
    return NextResponse.json({ error: "Failed to fetch payslips" }, { status: 500 });
  }
}
