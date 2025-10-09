// app/api/payroll/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function GET(_, { params }) {
  try {
    const user = await getUserSession();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    if (!["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(user.role))
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const payroll = await prisma.payroll.findUnique({
      where: { id: params.id },
      include: {
        payslips: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                position: true,
                department: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!payroll)
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 });

    return NextResponse.json(payroll);
  } catch (err) {
    console.error("Fetch Payroll Error:", err);
    return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 });
  }
}
