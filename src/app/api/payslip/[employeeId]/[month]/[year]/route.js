import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function GET(_, { params }) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { employeeId, month, year } = params;

    if (!["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(user.role) && user.id !== employeeId)
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const payslip = await prisma.payslip.findFirst({
      where: {
        employeeId,
        payroll: { month: Number(month), year: Number(year) },
      },
      include: {
        payroll: true,
        employee: { select: { firstName: true, lastName: true, position: true } },
      },
    });

    if (!payslip) return NextResponse.json({ error: "Payslip not found" }, { status: 404 });

    return NextResponse.json(payslip);
  } catch (err) {
    console.error("Fetch Specific Payslip Error:", err);
    return NextResponse.json({ error: "Failed to fetch payslip" }, { status: 500 });
  }
}
