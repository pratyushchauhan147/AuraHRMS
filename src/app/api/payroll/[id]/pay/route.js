import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function PATCH(_, { params }) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Only ADMIN can mark payroll as paid" }, { status: 403 });

    const payrollId = params.id;
    const payroll = await prisma.payroll.findUnique({ where: { id: payrollId } });
    if (!payroll) return NextResponse.json({ error: "Payroll not found" }, { status: 404 });

    if (payroll.status !== "GENERATED")
      return NextResponse.json({ error: `Payroll status must be GENERATED to mark PAID (current: ${payroll.status})` }, { status: 400 });

    await prisma.$transaction([
      prisma.payroll.update({ where: { id: payrollId }, data: { status: "PAID" } }),
      prisma.payslip.updateMany({ where: { payrollId }, data: { status: "PAID" } }),
    ]);

    return NextResponse.json({ message: "Payroll marked as paid" });
  } catch (err) {
    console.error("Payroll Payment Error:", err);
    return NextResponse.json({ error: "Failed to update payroll status" }, { status: 500 });
  }
}
