// src/app/api/payroll/generate/daywise/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function POST(req) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    if (!["ADMIN", "HR_RECRUITER"].includes(user.role))
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body received" }, { status: 400 });
    }

    const { month, year } = body;
    if (!month || !year)
      return NextResponse.json({ error: "Month and Year are required" }, { status: 400 });

    const monthNum = Number(month);
    const yearNum = Number(year);

    // Prevent duplicate payroll
    const existing = await prisma.payroll.findFirst({
      where: { month: monthNum, year: yearNum },
    });
    if (existing)
      return NextResponse.json({ error: `Payroll for ${monthNum}/${yearNum} already exists.` }, { status: 400 });

    // Fetch employees
    const employees = await prisma.employee.findMany({
      select: { id: true, salary: true },
    });
    if (employees.length === 0)
      return NextResponse.json({ error: "No employees found", status: 404 });

    const payroll = await prisma.payroll.create({
      data: {
        month: monthNum,
        year: yearNum,
        totalEmployees: employees.length,
        status: "PENDING",
      },
    });

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0); // last day of month
    const workingDays = endDate.getDate(); // total days in month

    let totalPayout = 0;

    for (const emp of employees) {
      // Fetch attendance
      const attendanceRecords = await prisma.attendance.findMany({
        where: { employeeId: emp.id, date: { gte: startDate, lte: endDate } },
      });

      const daysPresent = attendanceRecords.length;
      const absentDays = workingDays - daysPresent;

      // Daywise pay calculation
      const dailySalary = emp.salary / workingDays;
      const baseSalary = dailySalary * daysPresent;

      const deductions = 0; // no deductions for daywise simple version
      const taxes = 0; // no taxes for now
      const bonuses = 0;
      const netPay = Math.max(0, baseSalary + bonuses - deductions - taxes);

      await prisma.payslip.create({
        data: {
          employeeId: emp.id,
          payrollId: payroll.id,
          baseSalary,
          deductions,
          taxes,
          bonuses,
          netPay,
          remarks: `Daywise payroll generated for ${monthNum}/${yearNum} (${daysPresent} days present, ${absentDays} absent)`,
        },
      });

      totalPayout += netPay;
    }

    // Update payroll
    await prisma.payroll.update({
      where: { id: payroll.id },
      data: { totalPayout, status: "GENERATED" },
    });

    return NextResponse.json({
      message: `Daywise payroll for ${monthNum}/${yearNum} generated successfully`,
      payrollId: payroll.id,
      totalEmployees: employees.length,
      totalPayout,
    });
  } catch (err) {
    console.error("Daywise Payroll Generation Error:", err);
    return NextResponse.json({ error: "Failed to generate daywise payroll", details: err.message }, { status: 500 });
  }
}
