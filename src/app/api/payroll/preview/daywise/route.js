// src/app/api/payroll/preview/daywise/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function POST(req) {
  try {
    const user = await getUserSession();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    if (!["ADMIN", "HR_RECRUITER"].includes(user.role))
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const { month, year } = await req.json();
    if (!month || !year)
      return NextResponse.json({ error: "Month and year required" }, { status: 400 });

    // fetch employees
    const employees = await prisma.employee.findMany({
      where: { salary: { not: null } },
      select: { id: true, firstName: true, lastName: true, salary: true },
    });

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const totalDays = endOfMonth.getDate(); // total days in month

    const previews = [];

    for (const emp of employees) {
      const attendance = await prisma.attendance.findMany({
        where: {
          employeeId: emp.id,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      });

      const daysPresent = attendance.length;
      const perDaySalary = emp.salary / totalDays;
      const netPay = perDaySalary * daysPresent;

      previews.push({
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        baseSalary: emp.salary,
        daysPresent,
        absentDays: totalDays - daysPresent,
        netPay,
        bonuses: 0,
        deductions: 0,
        taxes: 0,
      });
    }

    const totalPayout = previews.reduce((sum, p) => sum + p.netPay, 0);

    return NextResponse.json({
      month,
      year,
      totalEmployees: employees.length,
      totalPayout,
      payslips: previews,
    });
  } catch (err) {
    console.error("Daywise Payroll Preview Error:", err);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}
