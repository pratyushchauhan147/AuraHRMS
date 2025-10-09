import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    if (!["ADMIN", "HR_RECRUITER", "SENIOR_MANAGER"].includes(user.role))
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const payrolls = await prisma.payroll.findMany({
      orderBy: { generatedAt: "desc" },
      include: {
        _count: {
          select: { payslips: true },
        },
      },
    });

    return NextResponse.json(payrolls);
  } catch (err) {
    console.error("Payroll Fetch Error:", err);
    return NextResponse.json({ error: "Failed to fetch payrolls" }, { status: 500 });
  }
}
